import type NotificationItem from "../items/NotificationItem";
import type { NotificationType } from "../items/NotificationType";

export default interface NotificationState {
  notifications: NotificationItem[];

  addNotification: (message: string, type?: NotificationType) => void;

  removeNotification: (id: string) => void;
}
