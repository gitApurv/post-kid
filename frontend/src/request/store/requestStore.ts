import { create } from "zustand";
import type RequestItemResponse from "../types/response/RequestItemResponse";
import type RequestItem from "../types/items/RequestItem";
import type RequestState from "../types/state/RequestState";
import { parseParams, parseHeaders } from "../utils/requestUtils";

export function mapResponseToRequestItem(
  res: RequestItemResponse,
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
    folderId: res.folderId,
    collectionId: res.collectionId,
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

  upsertRequestsFromResponse: (responses) => {
    const mapped = responses.map(mapResponseToRequestItem);
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
          ([, request]) => !request.folderId || !idSet.has(request.folderId),
        ),
      ),
    }));
  },

  removeRequestsByCollectionId: (collectionId) =>
    set((state) => ({
      requests: Object.fromEntries(
        Object.entries(state.requests).filter(
          ([, request]) => request.collectionId !== collectionId,
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

  setActiveRequestDirectly: (requestItem) => {
    get().setActiveRequest(requestItem);
    set({ activeCollectionId: null });
    get().setLastResponse(null);
  },

  setActiveCollection: (collectionId) => {
    set({
      activeCollectionId: collectionId,
      activeRequestId: null,
      activeRequest: null,
    });
    get().setLastResponse(null);
  },
}));

export default useRequestStore;
