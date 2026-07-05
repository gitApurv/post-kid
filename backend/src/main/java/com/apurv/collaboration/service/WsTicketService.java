package com.apurv.collaboration.service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WsTicketService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String TICKET_PREFIX = "ws_ticket:";
    private static final long TICKET_TTL_SECONDS = 60;

    public String createTicket(String userId) {
        String ticket = UUID.randomUUID().toString();
        String key = TICKET_PREFIX + ticket;

        redisTemplate.opsForValue().set(key, userId, TICKET_TTL_SECONDS, TimeUnit.SECONDS);
        log.debug("Created short-lived WS ticket for user: {}", userId);

        return ticket;
    }

    public String validateAndConsumeTicket(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return null;
        }

        String key = TICKET_PREFIX + ticket;
        String userId = redisTemplate.opsForValue().getAndDelete(key);

        if (userId != null) {
            log.debug("Consumed WS ticket for user: {}", userId);
            return userId;
        }

        log.warn("Invalid or expired WS ticket attempt");
        return null;
    }
}
