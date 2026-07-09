import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type WsTicketResponse from "../types/response/WsTicketResponse";
import type WebsocketState from "../types/state/WebsocketState";

let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

const useWebsocketStore = create<WebsocketState>((set, get) => {
  return {
    client: null,
    isConnected: false,
    isConnecting: false,
    error: null,

    connect: async () => {
      if (get().isConnected || get().isConnecting) return;

      set({ isConnecting: true, error: null });

      try {
        const response =
          await api.post<ApiResponse<WsTicketResponse>>("/ws-ticket");
        const ticket = response.data.data?.ticket;

        if (!ticket) {
          throw new Error("Failed to retrieve WebSocket ticket");
        }

        const baseURL =
          import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";
        const wsUrl = baseURL + `?ticket=${ticket}`;

        const stompClient = new Client({
          webSocketFactory: () => new SockJS(wsUrl),
          debug: (str) => {
            console.log("STOMP: " + str);
          },
          reconnectDelay: 0,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
          set({ isConnected: true, isConnecting: false, error: null });
        };

        stompClient.onDisconnect = () => {
          set({ isConnected: false, isConnecting: false });
        };

        stompClient.onStompError = (frame) => {
          console.error("STOMP error", frame);
          set({
            error: frame.headers["message"] || "STOMP error",
            isConnected: false,
            isConnecting: false,
          });
        };

        stompClient.onWebSocketClose = () => {
          set({ isConnected: false, isConnecting: false, client: null });
          if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
          }
          reconnectTimeoutId = setTimeout(() => {
            get().connect();
          }, 5000);
        };

        stompClient.activate();
        set({ client: stompClient });
      } catch (err) {
        console.error("WebSocket connection error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect to WebSocket";
        set({
          error: errorMessage,
          isConnecting: false,
          isConnected: false,
        });

        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
        }

        reconnectTimeoutId = setTimeout(() => {
          get().connect();
        }, 5000);
      }
    },

    disconnect: () => {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }
      const { client } = get();
      if (client) {
        client.deactivate();
        set({ client: null, isConnected: false, isConnecting: false });
      }
    },

    subscribe: (destination: string, callback: (message: unknown) => void) => {
      const { client, isConnected } = get();
      if (client && isConnected) {
        const subscription = client.subscribe(destination, (message) => {
          try {
            const parsed = JSON.parse(message.body);
            callback(parsed);
          } catch {
            callback(message.body);
          }
        });
        return () => subscription.unsubscribe();
      }
      return () => {};
    },
  };
});

export default useWebsocketStore;
