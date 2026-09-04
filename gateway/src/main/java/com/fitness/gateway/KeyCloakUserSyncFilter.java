package com.fitness.gateway;

import com.fitness.gateway.user.RegisterRequest;
import com.fitness.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeyCloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String headerUserId = exchange.getRequest().getHeaders().getFirst("X-User-ID");
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (token != null && !token.isBlank()) {
            RegisterRequest registerRequest = getUserDetails(token);
            String userId = headerUserId;
            if ((userId == null || userId.isBlank()) && registerRequest != null) {
                userId = registerRequest.getKeycloakId();
            }

            if (userId != null && !userId.isBlank()) {
                String finalUserId = userId;
                return userService.validateUser(finalUserId)
                        .flatMap(exist -> {
                            if (!Boolean.TRUE.equals(exist) && registerRequest != null) {
                                log.info("Syncing new user from Keycloak ID: {}", finalUserId);
                                return userService.registerUser(registerRequest)
                                        .doOnSuccess(u -> log.info("User synced successfully to PostgreSQL: {}", registerRequest.getEmail()))
                                        .doOnError(err -> log.error("Failed to sync user to PostgreSQL: {}", err.getMessage()))
                                        .onErrorResume(e -> Mono.empty())
                                        .then(Mono.empty());
                            } else {
                                log.debug("User already exists or registration data unavailable. Skipping sync.");
                                return Mono.empty();
                            }
                        })
                        .onErrorResume(err -> {
                            log.warn("Error during user validation check: {}", err.getMessage());
                            if (registerRequest != null) {
                                return userService.registerUser(registerRequest)
                                        .onErrorResume(e -> Mono.empty())
                                        .then(Mono.empty());
                            }
                            return Mono.empty();
                        })
                        .then(Mono.defer(() -> chain.filter(
                                exchange.mutate()
                                        .request(request -> request.header("X-User-ID", finalUserId))
                                        .build()
                        )));
            }
        }
        return chain.filter(exchange);
    }

    private RegisterRequest getUserDetails(String token) {
        try {
            if (token == null || token.isBlank()) {
                return null;
            }
            String tokenWithoutBearer = token.replace("Bearer", "").trim();
            SignedJWT signedJWT = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            String sub = claims.getStringClaim("sub");
            if (sub == null || sub.isBlank()) {
                return null;
            }

            String email = claims.getStringClaim("email");
            String username = claims.getStringClaim("preferred_username");
            if (email == null || email.isBlank()) {
                email = (username != null && !username.isBlank()) ? username + "@pulseforge.com" : sub + "@pulseforge.com";
            }

            String firstName = claims.getStringClaim("given_name");
            if (firstName == null || firstName.isBlank()) {
                firstName = (username != null && !username.isBlank()) ? username : "User";
            }

            String lastName = claims.getStringClaim("family_name");
            if (lastName == null || lastName.isBlank()) {
                lastName = "PulseForge";
            }

            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(email);
            registerRequest.setUsername(username != null && !username.isBlank() ? username : email.split("@")[0]);
            registerRequest.setKeycloakId(sub);
            registerRequest.setFirstName(firstName);
            registerRequest.setLastName(lastName);
            return registerRequest;
        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            return null;
        }
    }
}
