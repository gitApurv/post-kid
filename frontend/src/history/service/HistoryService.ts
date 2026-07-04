import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/ApiResponse";
import type HistoryResponse from "../types/response/HistoryResponse";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchHistories() {
  try {
    const res =
      await api.get<ApiResponse<{ content: HistoryResponse[] }>>("/history");
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch history.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch history."),
    };
  }
}

export async function deleteHistory(id: string) {
  try {
    const res = await api.delete<ApiResponse<void>>(`/history/${id}`);
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to delete history item.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete history item."),
    };
  }
}

export async function clearHistory() {
  try {
    const res = await api.delete<ApiResponse<void>>("/history/clear");
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to clear history.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to clear history."),
    };
  }
}

const HistoryService = {
  fetchHistories,
  deleteHistory,
  clearHistory,
};

export default HistoryService;
