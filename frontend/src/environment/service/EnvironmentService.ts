import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type EnvironmentResponse from "../types/response/EnvironmentResponse";
import type EnvironmentRequest from "../types/request/EnvironmentRequest";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchEnvironments(
  workspaceId: string,
  collectionId: string,
) {
  try {
    const res = await api.get<ApiResponse<EnvironmentResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch environments.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch environments."),
    };
  }
}

export async function addEnvironment(
  workspaceId: string,
  collectionId: string,
  request: EnvironmentRequest,
) {
  try {
    const res = await api.post<ApiResponse<EnvironmentResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to add environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add environment."),
    };
  }
}

export async function editEnvironment(
  workspaceId: string,
  collectionId: string,
  environmentId: string,
  request: EnvironmentRequest,
) {
  try {
    const res = await api.put<ApiResponse<EnvironmentResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to edit environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to edit environment."),
    };
  }
}

export async function deleteEnvironment(
  workspaceId: string,
  collectionId: string,
  environmentId: string,
) {
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to delete environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete environment."),
    };
  }
}

const EnvironmentService = {
  fetchEnvironments,
  addEnvironment,
  editEnvironment,
  deleteEnvironment,
};

export default EnvironmentService;
