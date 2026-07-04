export default interface RequestItemResponse {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers: Record<string, string> | null;
  body: string | null;
  authType: "none" | "bearer" | "basic" | null;
  authValue: Record<string, string> | null;
  timeoutMs: number | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
