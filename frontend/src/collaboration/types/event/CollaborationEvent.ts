import type { ActionType } from "./ActionType";
import type { EntityType } from "./EntityType";

export default interface CollaborationEvent<T = unknown> {
  entityType: EntityType;
  action: ActionType;
  workspaceId: string;
  payload: T;
  timestamp: string;
  actorId: string;
}
