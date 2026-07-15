export default interface RequestExecutionRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  authType: string;
  authValue: Record<string, string>;
  timeoutSeconds: number;
}
