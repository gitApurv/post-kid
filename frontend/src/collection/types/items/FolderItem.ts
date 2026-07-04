export default interface Folder {
  id: string;
  name: string;
  collectionId: string;
  parentFolderId?: string | null;
  isLoaded?: boolean;
  isLoading?: boolean;
}
