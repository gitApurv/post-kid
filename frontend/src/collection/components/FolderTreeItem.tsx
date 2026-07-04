import {
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  FolderPlus,
  FilePlus,
  RefreshCw,
} from "lucide-react";
import type FolderTreeItemProps from "../types/props/FolderTreeItemProps";
import RequestTreeItem from "./RequestTreeItem";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useFolderStore from "../store/FolderStore";
import useRequestStore from "../../request/store/RequestStore";
import { useChildFolders, useFolderRequests } from "../store/selectors";
import RequestService from "../../request/service/RequestService";
import FolderService from "../service/FolderService";

export default function FolderTreeItem({
  folder,
  collectionId,
  level,
  onAddFolder,
  onAddRequest,
}: FolderTreeItemProps) {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );

  const deleteFolderAction = useFolderStore(
    (state) => state.deleteFolderAction,
  );
  const isExpanded = useFolderStore(
    (state) => !!state.expandedFolderIds[folder.id],
  );
  const toggleFolderExpansion = useFolderStore(
    (state) => state.toggleFolderExpansion,
  );

  const childFolders = useChildFolders(folder.id);
  const folderRequests = useFolderRequests(folder.id);

  const handleExpandToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    toggleFolderExpansion(folder.id, nextState);
    if (nextState && !folder.isLoaded && !folder.isLoading) {
      const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!workspaceId) return;

      useFolderStore.getState().setFolderLoading(folder.id, true);

      const [subfoldersRes, requestsRes] = await Promise.all([
        FolderService.fetchSubfolders(workspaceId, collectionId, folder.id),
        FolderService.fetchFolderRequests(workspaceId, collectionId, folder.id),
      ]);

      if (!subfoldersRes.success) {
        useFolderStore.getState().setFolderLoading(folder.id, false);
        alert(subfoldersRes.error || "Failed to fetch subfolders.");
        return;
      }
      if (!requestsRes.success) {
        useFolderStore.getState().setFolderLoading(folder.id, false);
        alert(requestsRes.error || "Failed to fetch folder requests.");
        return;
      }

      useFolderStore.getState().upsertFolders(
        subfoldersRes.data.map((f) => ({
          id: f.id,
          name: f.name,
          collectionId,
          parentFolderId: folder.id,
          isLoaded: false,
        })),
      );
      useRequestStore
        .getState()
        .upsertRequestsFromResponse(requestsRes.data, collectionId, folder.id);

      useFolderStore.getState().upsertFolder({
        ...folder,
        isLoaded: true,
        isLoading: false,
      });
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to permanently delete folder '${folder.name}' and all its contents?`,
      )
    ) {
      const response = await deleteFolderAction(collectionId, folder.id);
      if (response && !response.success) {
        alert(response.error || "Failed to delete folder.");
      }
    }
  };

  const handleDeleteRequest = async (reqId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete API request '${name}'?`,
      )
    ) {
      const response = await RequestService.deleteFolderRequest(
        activeWorkspaceId!,
        collectionId,
        folder.id,
        reqId,
      );
      if (response && !response.success) {
        alert(response.error || "Failed to delete request.");
      } else {
        useRequestStore.getState().removeRequest(reqId);
      }
    }
  };

  const paddingLeft = `${level * 12 + 8}px`;

  return (
    <div className="space-y-1">
      {/* Folder Header */}
      <div
        onClick={handleExpandToggle}
        style={{ paddingLeft }}
        className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition-standard group relative"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        {isExpanded ? (
          <FolderOpen className="w-3.5 h-3.5 text-brand-primary shrink-0" />
        ) : (
          <FolderIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        <span className="text-xs font-medium truncate flex-1">
          {folder.name}
        </span>

        {folder.isLoading && (
          <RefreshCw className="w-3 h-3 text-slate-500 animate-spin shrink-0 mr-1" />
        )}

        {/* Folder context triggers */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFolder(collectionId, folder.id);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Add Subfolder"
            aria-label={`Add subfolder to ${folder.name}`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRequest(collectionId, folder.id);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Add Request"
            aria-label={`Add request to ${folder.name}`}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteFolder}
            className="p-0.5 hover:bg-brand-error/10 rounded text-slate-500 hover:text-brand-error transition-standard cursor-pointer"
            title="Delete Folder"
            aria-label={`Delete folder ${folder.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded sub-elements */}
      {isExpanded && (
        <div className="space-y-1">
          {/* Subfolders */}
          {childFolders.map((subFolder) => (
            <FolderTreeItem
              key={subFolder.id}
              folder={subFolder}
              collectionId={collectionId}
              level={level + 1}
              onAddFolder={onAddFolder}
              onAddRequest={onAddRequest}
            />
          ))}

          {/* Requests */}
          <div
            style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}
            className="space-y-0.5"
          >
            {folderRequests.map((request) => (
              <RequestTreeItem
                key={request.id}
                request={request}
                onDelete={handleDeleteRequest}
              />
            ))}

            {childFolders.length === 0 && folderRequests.length === 0 && (
              <div className="text-[10px] text-slate-600 italic py-1 pl-4">
                Empty suite
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
