import { Client } from "@stomp/stompjs";

export default interface WebsocketState {
  client: Client | null;

  isConnected: boolean;

  isConnecting: boolean;

  error: string | null;

  connect: () => Promise<void>;

  disconnect: () => void;

  subscribe: (
    destination: string,
    callback: (message: unknown) => void,
  ) => () => void;
}
