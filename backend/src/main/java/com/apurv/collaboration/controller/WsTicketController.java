package com.apurv.collaboration.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.collaboration.dto.WsTicketResponse;
import com.apurv.collaboration.service.WsTicketService;
import com.apurv.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/ws-ticket")
@RequiredArgsConstructor
public class WsTicketController {

    private final WsTicketService wsTicketService;

    @PostMapping
    public ResponseEntity<ApiResponse<WsTicketResponse>> getWsTicket(
            @AuthenticationPrincipal User currentUser) {

        String ticket = wsTicketService.createTicket(currentUser.getId().toString());

        return ResponseEntity.ok(
                ApiResponse.success("WebSocket ticket generated successfully", new WsTicketResponse(ticket)));
    }
}
