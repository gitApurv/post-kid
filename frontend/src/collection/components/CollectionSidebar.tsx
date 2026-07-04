import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  Trash2,
  FileCode,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import FolderTreeItem from "./FolderTreeItem";
import RequestTreeItem from "./RequestTreeItem";
import type Collection from "../types/items/CollectionItem";
import type RequestItem from "../../request/types/items/RequestItem";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useCollectionStore from "../store/CollectionStore";
import useFolderStore from "../store/FolderStore";
import useRequestStore from "../../request/store/RequestStore";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";
import { useRootFolders, useRootRequests } from "../store/selectors";
import CollectionService from "../service/CollectionService";
import FolderService from "../service/FolderService";
import RequestService from "../../request/service/RequestService";

// Sub-component to render the root-level collection items to clean up selectors
function CollectionTreeWrapper({
  collection,
  isExpanded,
  toggleCollection,
  onAddFolder,
  onAddRequest,
  onDeleteCollection,
  onDeleteRequest,
}: {
  collection: Collection;
  isExpanded: boolean;
  toggleCollection: (id: string) => void;
  onAddFolder: (colId: string, folderId: string | null) => void;
  onAddRequest: (colId: string, folderId: string | null) => void;
  onDeleteCollection: (id: string, name: string) => void;
  onDeleteRequest: (
    colId: string,
    folderId: string | null,
    id: string,
    name: string,
  ) => void;
}) {
  const activeCollectionId = useRequestStore(
    (state) => state.activeCollectionId,
  );
  const setActiveCollectionAction = useRequestStore(
    (state) => state.setActiveCollectionAction,
  );
  const folders = useRootFolders(collection.id);
  const requestItems = useRootRequests(collection.id);
  const isActive = collection.id === activeCollectionId;

  return (
    <div className="space-y-1">
      {/* Collection Title Panel */}
      <div
        className={`flex items-center justify-between px-2 py-1.5 rounded-md group relative transition-standard ${
          isActive
            ? "bg-brand-primary/10 text-white font-semibold"
            : "hover:bg-white/[0.01]"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-brand-primary rounded-r" />
        )}

        <span
          onClick={() => {
            setActiveCollectionAction(collection.id);
            if (!isExpanded) {
              toggleCollection(collection.id);
            }
          }}
          className={`text-xs font-bold truncate tracking-wide flex items-center gap-1.5 cursor-pointer flex-1 min-w-0 ${
            isActive ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleCollection(collection.id);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 shrink-0"
          >
            <ChevronRight
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </span>
          📦 {collection.name}
        </span>

        {collection.isLoading && (
          <RefreshCw className="w-3 h-3 text-slate-500 animate-spin mr-1.5 shrink-0" />
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFolder(collection.id, null);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Create Folder"
            aria-label={`Create folder in ${collection.name}`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRequest(collection.id, null);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Create Request"
            aria-label={`Create request in ${collection.name}`}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCollection(collection.id, collection.name);
            }}
            className="p-0.5 hover:bg-brand-error/10 rounded text-slate-500 hover:text-brand-error transition-standard cursor-pointer"
            title="Delete Collection"
            aria-label={`Delete collection ${collection.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Folders & Requests tree structure */}
      {isExpanded && (
        <div className="pl-2 ml-2 border-l border-slate-800/60 space-y-1.5">
          {/* Folders list */}
          {folders.map((folder) => (
            <FolderTreeItem
              key={folder.id}
              folder={folder}
              collectionId={collection.id}
              level={0}
              onAddFolder={onAddFolder}
              onAddRequest={onAddRequest}
            />
          ))}

          {/* Root requests list */}
          {requestItems.map((request) => (
            <RequestTreeItem
              key={request.id}
              request={request}
              onDelete={(reqId, name) =>
                onDeleteRequest(collection.id, null, reqId, name)
              }
            />
          ))}

          {folders.length === 0 && requestItems.length === 0 && (
            <div className="text-[10px] text-slate-600 italic py-1 pl-2">
              Empty collection
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CollectionSidebar() {
  const collectionsRecord = useCollectionStore((state) => state.collections);
  const collections = useMemo(
    () => Object.values(collectionsRecord),
    [collectionsRecord],
  );
  const deleteCollectionAction = useCollectionStore(
    (state) => state.deleteCollectionAction,
  );

  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const activeCollectionId = useRequestStore(
    (state) => state.activeCollectionId,
  );
  const setActiveCollectionAction = useRequestStore(
    (state) => state.setActiveCollectionAction,
  );

  const [expandedCollections, setExpandedCollections] = useState<
    Record<string, boolean>
  >({});
  const [showAddModal, setShowAddModal] = useState<{
    type: "collection" | "folder" | "request";
    collectionId?: string;
    folderId?: string | null;
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newRequestType, setNewRequestType] =
    useState<RequestItem["method"]>("GET");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      if (!activeWorkspaceId) {
        useCollectionStore.getState().reset();
        useFolderStore.getState().reset();
        useRequestStore.getState().reset();
        useEnvironmentStore.getState().reset();
        return;
      }
      useCollectionStore.getState().reset();
      useFolderStore.getState().reset();
      useRequestStore.getState().reset();
      useEnvironmentStore.getState().reset();
      const response =
        await CollectionService.fetchCollections(activeWorkspaceId);
      if (response.success) {
        useCollectionStore.getState().upsertCollections(response.data);
      } else {
        alert(response.error || "Failed to fetch collections.");
      }
    };
    loadCollections();
  }, [activeWorkspaceId]);

  const [prevShowAddModal, setPrevShowAddModal] =
    useState<typeof showAddModal>(showAddModal);
  if (showAddModal !== prevShowAddModal) {
    setPrevShowAddModal(showAddModal);
    setError(null);
    setIsLoading(false);
  }

  const toggleCollection = async (collectionId: string) => {
    const nextState = !expandedCollections[collectionId];
    setExpandedCollections((prev) => ({
      ...prev,
      [collectionId]: nextState,
    }));

    const collection = useCollectionStore.getState().collections[collectionId];
    if (
      nextState &&
      collection &&
      !collection.isLoaded &&
      !collection.isLoading
    ) {
      const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!workspaceId) return;

      useCollectionStore.getState().setCollectionLoading(collectionId, true);

      const [foldersRes, requestsRes] = await Promise.all([
        CollectionService.fetchCollectionFolders(workspaceId, collectionId),
        CollectionService.fetchCollectionRootRequests(
          workspaceId,
          collectionId,
        ),
      ]);

      if (!foldersRes.success) {
        useCollectionStore.getState().setCollectionLoading(collectionId, false);
        alert(foldersRes.error || "Failed to fetch collection folders.");
        return;
      }
      if (!requestsRes.success) {
        useCollectionStore.getState().setCollectionLoading(collectionId, false);
        alert(requestsRes.error || "Failed to fetch collection requests.");
        return;
      }

      useFolderStore.getState().upsertFolders(
        foldersRes.data.map((f) => ({
          id: f.id,
          name: f.name,
          collectionId,
          parentFolderId: null,
          isLoaded: false,
        })),
      );
      useRequestStore
        .getState()
        .upsertRequestsFromResponse(requestsRes.data, collectionId, null);

      useCollectionStore.getState().upsertCollection({
        ...collection,
        isLoaded: true,
        isLoading: false,
      });
    }
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !showAddModal || isLoading || !activeWorkspaceId)
      return;

    setIsLoading(true);
    setError(null);

    const { type, collectionId, folderId } = showAddModal;
    let response;
    if (type === "collection") {
      response = await CollectionService.createCollection(activeWorkspaceId, {
        name: newItemName,
        description: newItemDescription,
      });
      if (response.success) {
        useCollectionStore.getState().upsertCollection({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || "",
          isLoaded: true,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        });
      }
    } else if (type === "folder" && collectionId) {
      if (!folderId) {
        response = await FolderService.createFolder(
          activeWorkspaceId,
          collectionId,
          {
            name: newItemName,
          },
        );
      } else {
        response = await FolderService.createSubfolder(
          activeWorkspaceId,
          collectionId,
          folderId,
          {
            name: newItemName,
          },
        );
      }
      if (response.success) {
        useFolderStore.getState().upsertFolder({
          id: response.data.id,
          name: response.data.name,
          collectionId,
          parentFolderId: folderId || null,
          isLoaded: true,
        });
      }
    } else if (type === "request" && collectionId) {
      if (!folderId) {
        response = await RequestService.createRequest(
          activeWorkspaceId,
          collectionId,
          {
            name: newItemName,
            method: newRequestType,
            url: "{{base_url}}/endpoint",
          },
        );
      } else {
        response = await RequestService.createFolderRequest(
          activeWorkspaceId,
          collectionId,
          folderId,
          {
            name: newItemName,
            method: newRequestType,
            url: "{{base_url}}/endpoint",
          },
        );
      }
      if (response.success) {
        useRequestStore
          .getState()
          .upsertRequestsFromResponse(
            [response.data],
            collectionId,
            folderId || null,
          );
      }
    }

    if (response && !response.success) {
      setError(response.error || `Failed to add ${type}.`);
      setIsLoading(false);
    } else {
      if (collectionId) {
        if (!folderId) {
          setExpandedCollections((prev) => ({
            ...prev,
            [collectionId]: true,
          }));
          const collection =
            useCollectionStore.getState().collections[collectionId];
          if (collection && !collection.isLoaded && !collection.isLoading) {
            await toggleCollection(collectionId);
          }
        } else {
          useFolderStore.getState().toggleFolderExpansion(folderId, true);
          const folder = useFolderStore.getState().folders[folderId];
          if (folder && !folder.isLoaded && !folder.isLoading) {
            const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
            if (workspaceId) {
              useFolderStore.getState().setFolderLoading(folderId, true);
              const [subfoldersRes, requestsRes] = await Promise.all([
                FolderService.fetchSubfolders(
                  workspaceId,
                  collectionId,
                  folderId,
                ),
                FolderService.fetchFolderRequests(
                  workspaceId,
                  collectionId,
                  folderId,
                ),
              ]);
              if (subfoldersRes.success && requestsRes.success) {
                useFolderStore.getState().upsertFolders(
                  subfoldersRes.data.map((f) => ({
                    id: f.id,
                    name: f.name,
                    collectionId,
                    parentFolderId: folderId,
                    isLoaded: false,
                  })),
                );
                useRequestStore
                  .getState()
                  .upsertRequestsFromResponse(
                    requestsRes.data,
                    collectionId,
                    folderId,
                  );
                useFolderStore.getState().upsertFolder({
                  ...folder,
                  isLoaded: true,
                  isLoading: false,
                });
              } else {
                useFolderStore.getState().setFolderLoading(folderId, false);
              }
            }
          }
        }
      }
      setNewItemName("");
      setNewItemDescription("");
      setIsLoading(false);
      setShowAddModal(null);
    }
  };

  const handleCloseModal = () => {
    setNewItemName("");
    setNewItemDescription("");
    setNewRequestType("GET");
    setError(null);
    setIsLoading(false);
    setShowAddModal(null);
  };

  const handleDeleteCollection = async (collectionId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete collection '${name}' and all its folders/requests?`,
      )
    ) {
      const res = await deleteCollectionAction(collectionId);
      if (res && !res.success) {
        alert(res.error || "Failed to delete collection.");
      } else if (activeCollectionId === collectionId) {
        setActiveCollectionAction(null);
      }
    }
  };

  const handleDeleteRequest = async (
    collectionId: string,
    folderId: string | null,
    reqId: string,
    name: string,
  ) => {
    if (
      confirm(
        `Are you sure you want to permanently delete API request '${name}'?`,
      )
    ) {
      const res = folderId
        ? await RequestService.deleteFolderRequest(
            activeWorkspaceId!,
            collectionId,
            folderId,
            reqId,
          )
        : await RequestService.deleteRequest(
            activeWorkspaceId!,
            collectionId,
            reqId,
          );
      if (res && !res.success) {
        alert(res.error || "Failed to delete request.");
      } else {
        useRequestStore.getState().removeRequest(reqId);
      }
    }
  };

  return (
    <div className="w-64 bg-[#0B0F19] border-r border-white/5 h-full flex flex-col shrink-0 overflow-hidden relative z-30">
      {/* Search and Imports Header */}
      <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-brand-primary" />
            Collections
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddModal({ type: "collection" })}
              className="flex items-center gap-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 px-2 py-1 rounded text-[10px] font-semibold text-slate-300 transition-standard cursor-pointer"
              title="New Collection"
            >
              <Plus className="w-3 text-brand-primary" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Reactive Collections Accordion Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {collections.map((collection) => (
          <CollectionTreeWrapper
            key={collection.id}
            collection={collection}
            isExpanded={!!expandedCollections[collection.id]}
            toggleCollection={toggleCollection}
            onAddFolder={(collectionId, folderId) =>
              setShowAddModal({
                type: "folder",
                collectionId,
                folderId,
              })
            }
            onAddRequest={(collectionId, folderId) =>
              setShowAddModal({
                type: "request",
                collectionId,
                folderId,
              })
            }
            onDeleteCollection={handleDeleteCollection}
            onDeleteRequest={handleDeleteRequest}
          />
        ))}
        {collections.length === 0 && (
          <div className="text-[11px] text-slate-500 italic text-center py-8">
            No collections found. Click "New" to create one.
          </div>
        )}
      </div>

      {/* 5. Create Folders / Request Dialog */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={handleCloseModal}
            />

            <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-white/10 animate-float z-10">
              {/* Top card accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-90" />

              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-standard cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-semibold font-display text-white mb-4">
                Add New{" "}
                {showAddModal.type.charAt(0).toUpperCase() +
                  showAddModal.type.slice(1)}
              </h3>

              <form onSubmit={handleAddNewItem} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                    {showAddModal.type} name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isLoading}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={
                      showAddModal.type === "collection"
                        ? "User Service APIs"
                        : showAddModal.type === "folder"
                          ? "Authentication Suite"
                          : "Post Authenticate"
                    }
                    className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard disabled:opacity-50"
                  />
                </div>

                {showAddModal.type === "collection" && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                      Collection description
                    </label>
                    <textarea
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="Describe the purpose of this collection..."
                      rows={3}
                      disabled={isLoading}
                      className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard resize-none disabled:opacity-50"
                    />
                  </div>
                )}

                {showAddModal.type === "request" && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                      HTTP method
                    </label>
                    <select
                      value={newRequestType}
                      disabled={isLoading}
                      onChange={(e) =>
                        setNewRequestType(
                          e.target.value as RequestItem["method"],
                        )
                      }
                      className="block w-full bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-300 p-2 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard disabled:opacity-50"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-brand-error bg-brand-error/10 border border-brand-error/20 rounded-lg p-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 hover:shadow-[0_0_12px_rgba(99,102,241,0.35)] text-white rounded-lg text-[11px] font-semibold transition-standard cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Confirm Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
