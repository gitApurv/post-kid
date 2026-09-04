package com.apurv.history.service;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.history.document.RequestHistory;
import com.apurv.history.dto.HistoryResponse;
import com.apurv.history.repository.RequestHistoryRepository;
import com.apurv.request.dto.ExecutionRequest;
import com.apurv.request.dto.ExecutionResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    private final RequestHistoryRepository historyRepository;

    @Transactional
    public RequestHistory saveHistory(ExecutionRequest request, ExecutionResponse response, User currentUser) {
        RequestHistory requestHistory = RequestHistory.builder()
                .userId(currentUser.getId())
                .method(request.getMethod().name())
                .url(request.getUrl())
                .requestHeaders(request.getHeaders())
                .requestBody(request.getBody())
                .authType(request.getAuthType())
                .authValue(request.getAuthValue())
                .timeoutSeconds(request.getTimeoutSeconds())
                .statusCode(response.getStatusCode())
                .responseHeaders(response.getResponseHeaders())
                .responseBody(response.getResponseBody())
                .durationMs(response.getDurationMs())
                .success(response.isSuccess())
                .errorMessage(response.getErrorMessage())
                .executedAt(Instant.now())
                .build();

        RequestHistory saved = historyRepository.save(requestHistory);

        log.info("Saved request history with id: {} for userId: {}", saved.getId(), currentUser.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<HistoryResponse> getUserHistory(User currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return historyRepository.findByUserIdOrderByExecutedAtDesc(currentUser.getId(), pageable)
                .map(this::toHistoryResponse);
    }

    @Transactional
    public void deleteHistoryEntry(String historyId, User currentUser) {
        RequestHistory history = historyRepository.findByIdAndUserId(historyId, currentUser.getId());

        if (history == null) {
            throw new ResourceNotFoundException("History entry not found");
        }

        historyRepository.delete(history);
        log.info("Deleted history entry with id: {} for userId: {}", historyId, currentUser.getId());
    }

    @Transactional
    public void clearUserHistory(User currentUser) {
        historyRepository.deleteByUserId(currentUser.getId());
        log.info("Cleared history for userId: {}", currentUser.getId());
    }

    private HistoryResponse toHistoryResponse(RequestHistory history) {
        return HistoryResponse.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .method(history.getMethod())
                .url(history.getUrl())
                .requestHeaders(history.getRequestHeaders())
                .requestBody(history.getRequestBody())
                .authType(history.getAuthType())
                .authValue(history.getAuthValue())
                .timeoutSeconds(history.getTimeoutSeconds())
                .statusCode(history.getStatusCode())
                .responseHeaders(history.getResponseHeaders())
                .responseBody(history.getResponseBody())
                .durationMs(history.getDurationMs())
                .success(history.isSuccess())
                .errorMessage(history.getErrorMessage())
                .executedAt(history.getExecutedAt())
                .build();
    }

}
