export default interface RequestItem {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  params: { key: string; value: string; active: boolean }[];
  headers: { key: string; value: string; active: boolean }[];
  bodyType: "none" | "json" | "form-data";
  bodyJson: string;
  authType: "none" | "bearer" | "basic";
  authValue: Record<string, string>;
  folderId?: string | null;
  collectionId?: string | null;
  timeoutMs?: number;
}
