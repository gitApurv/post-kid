import type RequestItem from "../items/RequestItem";

export default interface RequestItemRequest {
  name: string;
  method: RequestItem["method"];
  url: string;
  body: string | null;
  headers?: Record<string, string>;
  authType?: RequestItem["authType"];
  authValue?: RequestItem["authValue"];
  timeoutMs?: number;
}
