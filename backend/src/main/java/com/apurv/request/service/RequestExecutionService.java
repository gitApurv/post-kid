package com.apurv.request.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient.RequestBodySpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;

import com.apurv.auth.entity.User;
import com.apurv.history.document.RequestHistory;
import com.apurv.history.service.HistoryService;
import com.apurv.request.dto.ExecutionRequest;
import com.apurv.request.dto.ExecutionResponse;
import com.apurv.request.dto.RequestExecutedEvent;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.workspace.repository.WorkspaceRepository;
import com.apurv.workspace.service.WorkspaceAuthorizationService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RequestExecutionService {

        private static final String TOPIC_REQUEST_EXECUTED = "request-executed-event-topic";

        private final WebClient webClient;
        private final WorkspaceRepository workspaceRepository;
        private final WorkspaceAuthorizationService workspaceAuthorizationService;
        private final HistoryService historyService;
        private final KafkaTemplate<String, RequestExecutedEvent> kafkaTemplate;

        public RequestExecutionService(WebClient.Builder webClientBuilder, HistoryService historyService,
                        WorkspaceRepository workspaceRepository,
                        WorkspaceAuthorizationService workspaceAuthorizationService,
                        KafkaTemplate<String, RequestExecutedEvent> kafkaTemplate) {
                this.webClient = webClientBuilder
                                .codecs(config -> config
                                                .defaultCodecs()
                                                .maxInMemorySize(10 * 1024 * 1024))
                                .build();
                this.historyService = historyService;
                this.workspaceRepository = workspaceRepository;
                this.workspaceAuthorizationService = workspaceAuthorizationService;
                this.kafkaTemplate = kafkaTemplate;
        }

        public ExecutionResponse executeRequest(UUID workspaceId, ExecutionRequest request,
                        User currentUser) {

                Workspace workspace = workspaceRepository.findById(workspaceId)
                                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN, WorkspaceRole.MEMBER);

                long startTime = System.currentTimeMillis();
                ExecutionResponse response;
                String errorType = null;
                Long responseSizeBytes = null;

                try {
                        validateUrl(request.getUrl());

                        RequestBodySpec requestSpec = webClient
                                        .method(toSpringMethod(request.getMethod()))
                                        .uri(request.getUrl());

                        if (request.getHeaders() != null) {
                                request.getHeaders().forEach(requestSpec::header);
                        }

                        if (request.getAuthType() != null && request.getAuthValue() != null) {
                                if ("bearer".equalsIgnoreCase(request.getAuthType())) {
                                        String token = request.getAuthValue().get("token");
                                        if (token != null && !token.isBlank()) {
                                                requestSpec.header("Authorization", "Bearer " + token);
                                        }
                                } else if ("basic".equalsIgnoreCase(request.getAuthType())) {
                                        String username = request.getAuthValue().get("username");
                                        String password = request.getAuthValue().get("password");
                                        if (username != null && password != null) {
                                                String credentials = java.util.Base64.getEncoder().encodeToString(
                                                                (username + ":" + password).getBytes(
                                                                                java.nio.charset.StandardCharsets.UTF_8));
                                                requestSpec.header("Authorization", "Basic " + credentials);
                                        }
                                }
                        }

                        RequestHeadersSpec<?> headersSpec = requestSpec;

                        if (request.getBody() != null && !request.getBody().isBlank()) {
                                headersSpec = requestSpec
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue(request.getBody());
                        }

                        ResponseEntity<String> httpResponse = headersSpec
                                        .retrieve()
                                        .onStatus(
                                                        status -> !status.is2xxSuccessful(),
                                                        clientResponse -> clientResponse.bodyToMono(String.class)
                                                                        .map(body -> new WebClientResponseException(
                                                                                        clientResponse.statusCode()
                                                                                                        .value(),
                                                                                        body, null,
                                                                                        null, null)))
                                        .toEntity(String.class)
                                        .timeout(Duration.ofSeconds(request.getTimeoutSeconds()))
                                        .block();

                        long duration = System.currentTimeMillis() - startTime;

                        Map<String, String> responseHeaders = new HashMap<>();
                        if (httpResponse != null) {
                                httpResponse.getHeaders()
                                                .forEach((key, values) -> responseHeaders.put(key,
                                                                String.join(",", values)));

                                if (httpResponse.getHeaders().getContentLength() >= 0) {
                                        responseSizeBytes = httpResponse.getHeaders().getContentLength();
                                }
                        }

                        String responseBody = httpResponse != null ? httpResponse.getBody() : null;
                        if (responseSizeBytes == null && responseBody != null) {
                                responseSizeBytes = (long) responseBody.getBytes(StandardCharsets.UTF_8).length;
                        }

                        log.info("Request {} to {} completed in {} ms with status code {}", request.getMethod(),
                                        request.getUrl(),
                                        duration,
                                        httpResponse != null ? httpResponse.getStatusCode().value() : 200);

                        response = ExecutionResponse.builder()
                                        .statusCode(httpResponse != null ? httpResponse.getStatusCode().value() : 200)
                                        .responseHeaders(responseHeaders)
                                        .responseBody(responseBody)
                                        .durationMs(duration)
                                        .success(true)
                                        .build();

                } catch (WebClientResponseException e) {
                        long duration = System.currentTimeMillis() - startTime;

                        log.warn("Request {} to {} failed in {} ms with status code {}",
                                        request.getMethod(),
                                        request.getUrl(), duration, e.getStatusCode().value());

                        errorType = e.getStatusCode().is4xxClientError() ? "HTTP_4XX" : "HTTP_5XX";
                        String responseBody = e.getResponseBodyAsString();
                        if (responseBody != null) {
                                responseSizeBytes = (long) responseBody.getBytes(StandardCharsets.UTF_8).length;
                        }

                        response = ExecutionResponse.builder()
                                        .statusCode(e.getStatusCode().value())
                                        .responseBody(responseBody)
                                        .durationMs(duration)
                                        .success(false)
                                        .errorMessage("Execution failed: " + e.getMessage()).build();
                } catch (Exception e) {
                        long duration = System.currentTimeMillis() - startTime;

                        log.error("Request {} to {} failed in {} ms with error: {}",
                                        request.getMethod(),
                                        request.getUrl(),
                                        duration,
                                        e.getMessage());

                        errorType = categorizeException(e);

                        response = ExecutionResponse.builder()
                                        .statusCode(0)
                                        .durationMs(duration)
                                        .success(false)
                                        .errorMessage("Execution failed: " + e.getMessage())
                                        .build();
                }

                RequestHistory savedHistory = historyService.saveHistory(request, response, currentUser);
                publishExecutionEvent(workspaceId, savedHistory, request, response, currentUser, errorType,
                                responseSizeBytes);
                return response;
        }

        private void publishExecutionEvent(UUID workspaceId, RequestHistory savedHistory, ExecutionRequest request,
                        ExecutionResponse response, User currentUser, String errorType,
                        Long responseSizeBytes) {
                try {
                        RequestExecutedEvent event = RequestExecutedEvent.builder()
                                        .eventId(UUID.randomUUID())
                                        .executionId(savedHistory.getId())
                                        .executedAt(savedHistory.getExecutedAt())
                                        .workspaceId(workspaceId)
                                        .userId(currentUser.getId())
                                        .method(request.getMethod().name())
                                        .url(request.getUrl())
                                        .targetHost(extractHost(request.getUrl()))
                                        .statusCode(response.getStatusCode())
                                        .durationMs(response.getDurationMs())
                                        .success(response.isSuccess())
                                        .errorType(errorType)
                                        .errorMessage(response.getErrorMessage())
                                        .responseSizeBytes(responseSizeBytes)
                                        .build();

                        kafkaTemplate.send(TOPIC_REQUEST_EXECUTED, workspaceId.toString(), event)
                                        .whenComplete((result, ex) -> {
                                                if (ex != null) {
                                                        log.error("Failed to send RequestExecutedEvent for executionId {}: {}",
                                                                        savedHistory.getId(), ex.getMessage());
                                                } else {
                                                        log.debug("Successfully published RequestExecutedEvent for executionId {}",
                                                                        savedHistory.getId());
                                                }
                                        });
                } catch (Exception ex) {
                        log.error("Failed to construct or publish RequestExecutedEvent for executionId {}: {}",
                                        savedHistory.getId(), ex.getMessage());
                }
        }

        private String extractHost(String url) {
                try {
                        return URI.create(url).getHost();
                } catch (Exception e) {
                        return null;
                }
        }

        private String categorizeException(Throwable e) {
                Throwable cause = e;
                while (cause != null) {
                        if (cause instanceof java.util.concurrent.TimeoutException) {
                                return "TIMEOUT";
                        }
                        if (cause instanceof java.net.UnknownHostException) {
                                return "DNS_ERROR";
                        }
                        if (cause instanceof java.net.ConnectException) {
                                return "CONNECTION_REFUSED";
                        }
                        cause = cause.getCause();
                }
                return "NETWORK_ERROR";
        }

        private HttpMethod toSpringMethod(com.apurv.request.entity.HttpMethod method) {
                return HttpMethod.valueOf(method.name());
        }

        private void validateUrl(String url) {
                try {
                        new URI(url).toURL();
                } catch (Exception e) {
                        throw new IllegalArgumentException("Invalid URL");
                }

        }
}
