import type NotificationItem from "./NotificationItem";
import type { NotificationType } from "./NotificationType";

export default interface NotificationState {
  notifications: NotificationItem[];

  addNotification: (message: string, type?: NotificationType) => void;

  removeNotification: (id: string) => void;
}
