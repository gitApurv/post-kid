export default interface Collection {
  id: string;
  name: string;
  description: string | null;
  isLoaded?: boolean;
  isLoading?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
