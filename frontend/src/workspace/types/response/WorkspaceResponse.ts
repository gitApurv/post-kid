export default interface WorkspaceResponse {
  id: string;
  name: string;
  description: string | null;
  ownerUsername: string;
  memberCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
