import type { NotificationType } from "./NotificationType";

export default interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}
