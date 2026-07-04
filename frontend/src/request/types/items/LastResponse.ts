export default interface LastResponse {
  status: number;
  statusText: string;
  latency: number;
  size: number;
  headers: Record<string, string>;
  body: string;
}
