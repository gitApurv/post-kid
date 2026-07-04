export default interface HistoryItem {
  id: string;
  userId: string;
  requestItemId: string;
  collectionId: string;

  method: string;
  url: string;
  requestHeaders: { [key: string]: string };
  requestBody: string;
  authType: string;
  authValue: { [key: string]: string };
  timeoutSeconds: number;

  statusCode: number;
  responseHeaders: { [key: string]: string };
  responseBody: string;
  durationMs: number;
  success: boolean;
  errorMessage: string;

  executedAt: string;
}
