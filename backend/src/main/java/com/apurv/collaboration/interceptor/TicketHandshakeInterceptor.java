package com.apurv.collaboration.interceptor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.apurv.collaboration.service.WsTicketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class TicketHandshakeInterceptor implements HandshakeInterceptor {

    private final WsTicketService wsTicketService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            String ticket = servletRequest.getServletRequest().getParameter("ticket");

            if (ticket != null && !ticket.isBlank()) {
                String userId = wsTicketService.validateAndConsumeTicket(ticket);

                if (userId != null) {
                    attributes.put("userId", userId);
                    log.info("Handshake authenticated via ticket for user: {}", userId);
                    return true;
                }
            }
        }

        log.warn("Handshake authentication failed: ticket missing or invalid");
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
    }
}
