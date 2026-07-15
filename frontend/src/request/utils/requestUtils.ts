import type EnvironmentVariable from "../../environment/types/items/EnvironmentVariable";
import type RequestItem from "../types/items/RequestItem";
import type RequestItemRequest from "../types/request/RequestItemRequest";

// Resolve {{variable}} placeholders against active environment
export function resolveVariables(
  text: string,
  variables: Record<string, EnvironmentVariable>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const match = Object.values(variables).find((v) => v.key === key);
    return match ? match.value : `{{${key}}}`; // leave unresolved if no match
  });
}

// Serialize RequestItem → RequestItemRequest payload for API
export function serializeRequest(request: RequestItem): RequestItemRequest {
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

// Parse query params out of a URL string
export function parseParams(
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

// Flatten Record<string, string> headers into structured array
export function parseHeaders(
  headers: Record<string, string> | null,
): { key: string; value: string; active: boolean }[] {
  if (!headers) return [];
  return Object.entries(headers).map(([key, value]) => ({
    key,
    value,
    active: true,
  }));
}
