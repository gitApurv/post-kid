package com.apurv.collaboration.handler;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.apurv.collaboration.security.StompPrincipal;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TicketHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        String userId = (String) attributes.get("userId");

        if (userId == null) {
            log.warn("Handshake attributes missing 'userId'");
            return null;
        }

        log.debug("Setting Principal userId: {} for WS session", userId);
        return new StompPrincipal(userId);
    }
}
