let activeWorkspaceId: string | null = null;

export function getActiveWorkspaceId(): string | null {
  return activeWorkspaceId;
}

export function setActiveWorkspaceId(id: string | null) {
  activeWorkspaceId = id;
}
