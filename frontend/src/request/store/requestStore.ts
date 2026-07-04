import { create } from "zustand";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";
import RequestService from "../service/RequestService";
import type RequestItemRequest from "../types/request/RequestItemRequest";
import type RequestItemResponse from "../types/response/RequestItemResponse";
import type RequestItem from "../types/items/RequestItem";
import type RequestState from "../types/state/RequestState";
import type Variable from "../../environment/types/items/Variable";

// ── Utility: resolve {{variable}} placeholders against active environment ──
function resolveVariables(
  text: string,
  variables: Record<string, Variable>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const match = Object.values(variables).find((v) => v.key === key);
    return match ? match.value : `{{${key}}}`; // leave unresolved if no match
  });
}

// ── Utility: serialize RequestItem → RequestItemRequest payload for API ──
function serializeRequest(request: RequestItem): RequestItemRequest {
  const baseUrl = request.url.split("?")[0];
  const activeParams = request.params.filter(
    (param) => param.active && param.key,
  );
  const queryString = activeParams
    .map(
      (param) =>
        `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
    )
    .join("&");
  const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  const headers: Record<string, string> = Object.fromEntries(
    request.headers
      .filter((header) => header.active && header.key)
      .map((header) => [header.key, header.value]),
  );

  return {
    name: request.name,
    method: request.method,
    url: fullUrl,
    headers,
    body: request.bodyType === "none" ? null : request.bodyJson || null,
    authType: request.authType,
    authValue: request.authValue,
    timeoutMs: request.timeoutMs ?? 5000,
  };
}

// ── Utility: parse query params out of a URL string ──
function parseParams(
  url: string,
): { key: string; value: string; active: boolean }[] {
  const queryString = url.split("?")[1] || "";
  return queryString
    .split("&")
    .filter(Boolean)
    .map((param) => {
      const [key, value] = param.split("=");
      return { key, value: decodeURIComponent(value || ""), active: true };
    });
}

// ── Utility: flatten Record<string, string> headers into structured array ──
function parseHeaders(
  headers: Record<string, string> | null,
): { key: string; value: string; active: boolean }[] {
  if (!headers) return [];
  return Object.entries(headers).map(([key, value]) => ({
    key,
    value,
    active: true,
  }));
}

// ── Utility: map RequestItemResponse DTO → RequestItem ──
export function mapResponseToRequestItem(
  res: RequestItemResponse,
  collectionId: string,
  folderId: string | null,
): RequestItem {
  return {
    id: res.id,
    name: res.name,
    method: res.method,
    url: res.url || "",
    params: parseParams(res.url || ""),
    headers: parseHeaders(res.headers),
    bodyType: res.body ? "json" : "none",
    bodyJson: res.body || "",
    authType: res.authType || "none",
    authValue: res.authValue || {},
    folderId: folderId,
    collectionId: collectionId,
    timeoutMs: res.timeoutMs || 5000,
  };
}

const useRequestStore = create<RequestState>((set, get) => ({
  requests: {},
  activeRequestId: null,
  activeRequest: null,
  activeCollectionId: null,
  isExecuting: false,
  lastResponse: null,

  // ─── Mutations ─────────────────────────────────────────────────

  upsertRequest: (requestItem) =>
    set((state) => ({
      requests: { ...state.requests, [requestItem.id]: requestItem },
    })),

  upsertRequests: (requestsList) =>
    set((state) => ({
      requests: {
        ...state.requests,
        ...Object.fromEntries(
          requestsList.map((requestItem) => [requestItem.id, requestItem]),
        ),
      },
    })),

  upsertRequestsFromResponse: (responseList, collectionId, folderId) => {
    const mapped = responseList.map((response) =>
      mapResponseToRequestItem(response, collectionId, folderId ?? null),
    );
    get().upsertRequests(mapped);
  },

  removeRequest: (requestId) =>
    set((state) => {
      const remainingRequests = { ...state.requests };
      delete remainingRequests[requestId];
      return { requests: remainingRequests };
    }),

  removeRequestsByFolderIds: (folderIds) => {
    const idSet = new Set(folderIds);
    set((state) => ({
      requests: Object.fromEntries(
        Object.entries(state.requests).filter(
          ([, r]) => !r.folderId || !idSet.has(r.folderId),
        ),
      ),
    }));
  },

  removeRequestsByCollectionId: (collectionId) =>
    set((state) => ({
      requests: Object.fromEntries(
        Object.entries(state.requests).filter(
          ([, requestItem]) => requestItem.collectionId !== collectionId,
        ),
      ),
    })),

  reset: () =>
    set({
      requests: {},
      activeRequestId: null,
      activeRequest: null,
      activeCollectionId: null,
      isExecuting: false,
      lastResponse: null,
    }),

  setActiveRequest: (activeRequest) =>
    set({
      activeRequestId: activeRequest ? activeRequest.id : null,
      activeRequest,
    }),

  updateActiveRequestFields: (fields) =>
    set((state) => {
      if (!state.activeRequest) return state;
      return {
        activeRequest: {
          ...state.activeRequest,
          ...fields,
        },
      };
    }),

  setExecuting: (isExecuting) => set({ isExecuting }),

  setLastResponse: (lastResponse) => set({ lastResponse }),

  // ─── Actions ─────────────────────────────────────────────────

  setActiveRequestDirectlyAction: (requestItem) => {
    get().setActiveRequest(requestItem);
    set({ activeCollectionId: null });
    get().setLastResponse(null);
    return { success: true };
  },

  setActiveCollectionAction: (collectionId) => {
    set({
      activeCollectionId: collectionId,
      activeRequestId: null,
      activeRequest: null,
    });
    get().setLastResponse(null);
    return { success: true };
  },

  updateActiveRequestAction: async (fields) => {
    const activeRequest = get().activeRequest;
    if (!activeRequest)
      return { success: false, error: "No active request to update" };

    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId) {
      return { success: false, error: "No active workspace selected" };
    }

    get().updateActiveRequestFields(fields);
    const updatedRequest = { ...activeRequest, ...fields };

    const payload = serializeRequest(updatedRequest);

    const response = await RequestService.updateRequest(
      activeWorkspaceId,
      updatedRequest.collectionId!,
      updatedRequest.folderId || null,
      updatedRequest.id,
      payload,
    );

    if (!response.success) {
      get().updateActiveRequestFields(activeRequest);
      return response;
    }

    const canonical = mapResponseToRequestItem(
      response.data,
      updatedRequest.collectionId!,
      updatedRequest.folderId ?? null,
    );
    get().upsertRequest(canonical);
    get().setActiveRequest(canonical);

    return { success: true };
  },

  executeRequestAction: async () => {
    const request = get().activeRequest;
    if (!request) return { success: false, error: "No active request" };

    const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!workspaceId)
      return { success: false, error: "No active workspace selected" };

    const { environments, activeEnvironmentId } =
      useEnvironmentStore.getState();
    const activeEnv = environments[activeEnvironmentId];
    const variables = activeEnv?.variables ?? {};

    const resolvedUrl = resolveVariables(request.url, variables);
    const resolvedHeaders = Object.fromEntries(
      request.headers
        .filter((header) => header.active && header.key)
        .map((header) => [
          resolveVariables(header.key, variables),
          resolveVariables(header.value, variables),
        ]),
    );
    const resolvedBody =
      request.bodyType !== "none"
        ? resolveVariables(request.bodyJson || "", variables)
        : "";

    const payload = {
      url: resolvedUrl,
      method: request.method,
      headers: resolvedHeaders,
      body: resolvedBody,
      authType: request.authType,
      authValue: request.authValue,
      timeoutSeconds: Math.floor((request.timeoutMs ?? 5000) / 1000),
    };

    get().setExecuting(true);
    get().setLastResponse(null);

    const res = await RequestService.executeRequest(
      workspaceId,
      request.collectionId!,
      request.folderId ?? null,
      payload,
    );

    get().setExecuting(false);

    if (!res.success) {
      get().setLastResponse({
        status: 500,
        statusText: "Error",
        latency: 0,
        size: 0,
        headers: {},
        body: res.error ?? "Request failed",
      });
      return res;
    }

    const exec = res.data;

    get().setLastResponse({
      status: exec.statusCode,
      statusText: exec.success ? "OK" : "Error",
      latency: exec.durationMs,
      size: exec.responseBody ? new Blob([exec.responseBody]).size : 0,
      headers: exec.responseHeaders ?? {},
      body: exec.errorMessage ?? exec.responseBody ?? "",
    });

    return { success: true };
  },
}));

export default useRequestStore;
