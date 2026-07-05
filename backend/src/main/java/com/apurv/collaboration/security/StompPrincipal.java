package com.apurv.collaboration.security;

import java.security.Principal;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class StompPrincipal implements Principal {

    private final String userId;

    @Override
    public String getName() {
        return userId;
    }
}
