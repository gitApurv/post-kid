import type LastResponse from "../items/LastResponse";
import type RequestItem from "../items/RequestItem";
import type RequestItemResponse from "../response/RequestItemResponse";

export default interface RequestState {
  requests: Record<string, RequestItem>;
  activeRequestId: string | null;
  activeRequest: RequestItem | null;
  activeCollectionId: string | null;
  isExecuting: boolean;
  lastResponse: LastResponse | null;

  // Mutations
  upsertRequest: (request: RequestItem) => void;

  upsertRequests: (requests: RequestItem[]) => void;

  upsertRequestsFromResponse: (
    requests: RequestItemResponse[],
    collectionId: string,
    folderId: string | null,
  ) => void;

  removeRequest: (id: string) => void;

  removeRequestsByFolderIds: (folderIds: string[]) => void;

  removeRequestsByCollectionId: (collectionId: string) => void;

  setActiveRequest: (activeRequest: RequestItem | null) => void;

  updateActiveRequestFields: (fields: Partial<RequestItem>) => void;

  setExecuting: (isExecuting: boolean) => void;

  setLastResponse: (response: LastResponse | null) => void;

  reset: () => void;

  // Actions
  setActiveRequestDirectlyAction: (req: RequestItem | null) => void;

  setActiveCollectionAction: (id: string | null) => void;

  updateActiveRequestAction: (
    fields: Partial<RequestItem>,
  ) => Promise<{ success: boolean; error?: string }>;

  executeRequestAction: () => Promise<{ success: boolean; error?: string }>;
}
