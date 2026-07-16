package com.apurv.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.apurv.collaboration.handler.TicketHandshakeHandler;
import com.apurv.collaboration.interceptor.TicketHandshakeInterceptor;
import com.apurv.collaboration.interceptor.WorkspaceSubscriptionInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${postKid.cors.allowed-origins}")
    private String allowedOrigins;

    private final TicketHandshakeInterceptor ticketHandshakeInterceptor;
    private final TicketHandshakeHandler ticketHandshakeHandler;
    private final WorkspaceSubscriptionInterceptor workspaceSubscriptionInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] allowedOriginsArray = allowedOrigins.split(",");

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOriginsArray)
                .addInterceptors(ticketHandshakeInterceptor)
                .setHandshakeHandler(ticketHandshakeHandler)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(workspaceSubscriptionInterceptor);
    }

}
