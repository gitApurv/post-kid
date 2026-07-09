export default interface FolderResponse {
  id: string;
  name: string;
  createdAt: string;
  collectionId: string;
  parentFolderId: string | null;
}
