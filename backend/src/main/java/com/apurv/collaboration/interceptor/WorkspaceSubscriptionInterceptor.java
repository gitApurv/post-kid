package com.apurv.collaboration.interceptor;

import java.security.Principal;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.apurv.collaboration.security.StompPrincipal;
import com.apurv.workspace.service.WorkspaceAuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceSubscriptionInterceptor implements ChannelInterceptor {

    private final WorkspaceAuthorizationService workspaceAuthorizationService;

    private static final Pattern WORKSPACE_DESTINATION_PATTERN = Pattern
            .compile("^/topic/workspace/([^/]+)(?:/presence)?$");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = WORKSPACE_DESTINATION_PATTERN.matcher(destination);
                if (matcher.matches()) {
                    String workspaceIdStr = matcher.group(1);
                    Principal principal = accessor.getUser();

                    if (principal instanceof StompPrincipal stompPrincipal) {
                        try {
                            UUID workspaceId = UUID.fromString(workspaceIdStr);
                            UUID userId = UUID.fromString(stompPrincipal.getUserId());

                            if (!workspaceAuthorizationService.isMember(workspaceId, userId)) {
                                log.warn("Denying subscription to destination {} for user {} - not a member",
                                        destination, userId);
                                throw new AccessDeniedException("User is not a member of this workspace");
                            }
                            log.debug("Approved subscription to destination {} for user {}", destination, userId);
                        } catch (IllegalArgumentException e) {
                            log.warn("Invalid workspaceId or userId format in subscription destination: {}",
                                    destination);
                            throw new IllegalArgumentException("Invalid workspace ID format");
                        }
                    } else {
                        log.warn("Denying subscription to destination {} - unauthenticated principal", destination);
                        throw new AccessDeniedException("Unauthenticated connection");
                    }
                }
            }
        }
        return message;
    }
}
