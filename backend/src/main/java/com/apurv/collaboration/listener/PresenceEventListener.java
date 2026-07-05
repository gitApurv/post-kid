package com.apurv.collaboration.listener;

import java.security.Principal;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import com.apurv.collaboration.dto.PresenceEventStatus;
import com.apurv.collaboration.security.StompPrincipal;
import com.apurv.collaboration.service.PresenceEventPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PresenceEventListener {

    private static final String WORKSPACE_ID_SESSION_ATTR = "presence.workspaceId";

    private static final Pattern PRESENCE_DESTINATION_PATTERN = Pattern.compile("^/topic/workspace/([^/]+)/presence$");

    private final PresenceEventPublisher presenceEventPublisher;

    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        Matcher matcher = PRESENCE_DESTINATION_PATTERN.matcher(destination);
        if (!matcher.matches()) {
            return;
        }

        String workspaceId = matcher.group(1);
        Principal rawPrincipal = accessor.getUser();
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

        if (rawPrincipal == null) {
            log.warn("Presence subscribe event missing principal for workspace {}", workspaceId);
            return;
        }
        if (!(rawPrincipal instanceof StompPrincipal principal)) {
            log.warn("Presence subscribe event has non-StompPrincipal principal for workspace {}", workspaceId);
            return;
        }
        if (sessionAttributes == null) {
            log.warn("Presence subscribe event missing session attributes for workspace {}", workspaceId);
            return;
        }

        sessionAttributes.put(WORKSPACE_ID_SESSION_ATTR, workspaceId);

        String userId = principal.getUserId();

        presenceEventPublisher.publish(workspaceId, userId, PresenceEventStatus.ONLINE);
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal rawPrincipal = accessor.getUser();
        if (rawPrincipal == null) {
            return;
        }
        if (!(rawPrincipal instanceof StompPrincipal principal)) {
            log.warn("Presence disconnect event has non-StompPrincipal principal");
            return;
        }

        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return;
        }

        String workspaceId = (String) sessionAttributes.get(WORKSPACE_ID_SESSION_ATTR);
        if (workspaceId == null) {
            return;
        }

        String userId = principal.getUserId();

        presenceEventPublisher.publish(workspaceId, userId, PresenceEventStatus.OFFLINE);
        log.info("User {} disconnected from workspace {}", userId, workspaceId);
    }
}