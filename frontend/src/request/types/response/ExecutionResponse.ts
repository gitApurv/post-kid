export default interface ExecutionResponse {
  statusCode: number;
  responseHeaders: Record<string, string> | null;
  responseBody: string | null;
  durationMs: number;
  errorMessage: string | null;
  success: boolean;
}
