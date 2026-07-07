import { create } from "zustand";
import type { NotificationType } from "../types/NotificationType";
import type NotificationState from "../types/NotificationState";

const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message: string, type: NotificationType = "INFO") =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type },
      ],
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
}));

export default useNotificationStore;
