package com.apurv.collaboration.listener;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
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

    private final Map<String, Map<String, Set<String>>> workspaceUserSessions = new ConcurrentHashMap<>();

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

        String userId = principal.getUserId();
        String sessionId = accessor.getSessionId();
        String oldWorkspaceId = (String) sessionAttributes.get(WORKSPACE_ID_SESSION_ATTR);

        if (oldWorkspaceId != null && !oldWorkspaceId.equals(workspaceId)) {
            Map<String, Set<String>> oldUserSessions = workspaceUserSessions.get(oldWorkspaceId);
            if (oldUserSessions != null) {
                Set<String> oldSessions = oldUserSessions.get(userId);
                if (oldSessions != null) {
                    oldSessions.remove(sessionId);
                    if (oldSessions.isEmpty()) {
                        oldUserSessions.remove(userId);
                        if (oldUserSessions.isEmpty()) {
                            workspaceUserSessions.remove(oldWorkspaceId);
                        }
                        presenceEventPublisher.publish(oldWorkspaceId, userId, PresenceEventStatus.OFFLINE);
                        log.info("User {} switched workspace from {}", userId, oldWorkspaceId);
                    }
                }
            }
        }

        sessionAttributes.put(WORKSPACE_ID_SESSION_ATTR, workspaceId);
        workspaceUserSessions.computeIfAbsent(workspaceId, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);

        log.info("User {} subscribed to workspace {}", userId, workspaceId);

        presenceEventPublisher.publish(workspaceId, userId, PresenceEventStatus.ONLINE);

        Map<String, Set<String>> activeUsers = workspaceUserSessions.get(workspaceId);
        if (activeUsers != null) {
            for (String onlineUserId : activeUsers.keySet()) {
                if (!onlineUserId.equals(userId)) {
                    presenceEventPublisher.publish(workspaceId, onlineUserId, PresenceEventStatus.ONLINE);
                }
            }
        }
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
        String sessionId = accessor.getSessionId();

        Map<String, Set<String>> userSessions = workspaceUserSessions.get(workspaceId);
        if (userSessions != null) {
            Set<String> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                    if (userSessions.isEmpty()) {
                        workspaceUserSessions.remove(workspaceId);
                    }
                    presenceEventPublisher.publish(workspaceId, userId, PresenceEventStatus.OFFLINE);
                    log.info("User {} disconnected from workspace {}", userId, workspaceId);
                }
            }
        }
    }
}