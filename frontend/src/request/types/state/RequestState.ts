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

  upsertRequest: (request: RequestItem) => void;

  upsertRequests: (requests: RequestItem[]) => void;

  upsertRequestsFromResponse: (requests: RequestItemResponse[]) => void;

  removeRequest: (requestId: string) => void;

  removeRequestsByFolderIds: (folderIds: string[]) => void;

  removeRequestsByCollectionId: (collectionId: string) => void;

  setActiveRequest: (activeRequest: RequestItem | null) => void;

  setActiveRequestDirectly: (req: RequestItem | null) => void;

  setActiveCollection: (collectionId: string | null) => void;

  updateActiveRequestFields: (fields: Partial<RequestItem>) => void;

  setExecuting: (isExecuting: boolean) => void;

  setLastResponse: (response: LastResponse | null) => void;

  reset: () => void;
}
