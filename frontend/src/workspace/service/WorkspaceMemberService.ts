import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type MemberResponse from "../types/response/MemberResponse";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchMembers(workspaceId: string) {
  try {
    const res = await api.get<ApiResponse<MemberResponse[]>>(
      `/workspaces/${workspaceId}/members`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch members.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch members."),
    };
  }
}

const WorkspaceMemberService = {
  fetchMembers,
};

export default WorkspaceMemberService;
