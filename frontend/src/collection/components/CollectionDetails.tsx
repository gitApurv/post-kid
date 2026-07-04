import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Folder,
  Edit3,
  Check,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import EnvironmentScopeList from "../../environment/components/EnvironmentScopeList";
import VariableMatrixGrid from "../../environment/components/VariableMatrixGrid";
import CreateEnvironmentModal from "../../environment/components/CreateEnvironmentModal";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useCollectionStore from "../store/CollectionStore";
import useRequestStore from "../../request/store/RequestStore";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";
import { useRootFolderCount } from "../store/selectors";
import CollectionService from "../service/CollectionService";

export default function CollectionDetails() {
  const activeCollectionId = useRequestStore(
    (state) => state.activeCollectionId,
  );
  const collections = useCollectionStore((state) => state.collections);
  const fetchEnvironments = useEnvironmentStore(
    (state) => state.fetchEnvironmentsAction,
  );
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const activeWorkspace = activeWorkspaceId
    ? workspaces[activeWorkspaceId]
    : undefined;

  const collection = activeCollectionId
    ? collections[activeCollectionId]
    : undefined;
  const folderCount = useRootFolderCount(collection?.id || "");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAddEnvModal, setShowAddEnvModal] = useState(false);

  useEffect(() => {
    if (activeCollectionId) {
      fetchEnvironments(activeCollectionId);
    }
  }, [activeCollectionId, fetchEnvironments]);

  const [prevCollectionId, setPrevCollectionId] = useState<string | undefined>(
    collection?.id,
  );
  const [prevCollectionName, setPrevCollectionName] = useState<
    string | undefined
  >(collection?.name);
  const [prevCollectionDesc, setPrevCollectionDesc] = useState<
    string | undefined
  >(collection?.description ?? undefined);

  if (
    collection?.id !== prevCollectionId ||
    collection?.name !== prevCollectionName ||
    collection?.description !== prevCollectionDesc
  ) {
    setPrevCollectionId(collection?.id);
    setPrevCollectionName(collection?.name);
    setPrevCollectionDesc(collection?.description ?? undefined);
    if (collection) {
      setEditName(collection.name);
      setEditDescription(collection.description || "");
      setIsEditing(false);
      setErrorMsg("");
    }
  }

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8 bg-brand-layer-1/10 rounded-xl border border-dashed border-white/5">
        <p className="text-xs text-slate-500">
          Collection not found or has been deleted.
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;

    setIsSaving(true);
    setErrorMsg("");
    const res = await CollectionService.updateCollection(
      activeWorkspaceId,
      collection.id,
      {
        name: editName.trim(),
        description: editDescription.trim(),
      },
    );
    setIsSaving(false);

    if (res.success) {
      useCollectionStore.getState().upsertCollection({
        ...collection,
        name: res.data.name,
        description: res.data.description || "",
        updatedAt: res.data.updatedAt,
      });
      setIsEditing(false);
    } else {
      setErrorMsg(res.error || "Failed to update collection.");
    }
  };

  const formattedCreatedDate = collection.createdAt
    ? new Date(collection.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-5xl mx-auto w-full text-slate-200">
      {/* Header Panel */}
      <div className="glass-panel-glow rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Collection Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
                placeholder="No description provided. Write one to help your team understand this API collection."
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-brand-error font-medium">{errorMsg}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(collection.name);
                  setEditDescription(collection.description || "");
                  setErrorMsg("");
                }}
                className="px-3 py-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer transition-standard"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-brand-primary hover:bg-brand-secondary disabled:bg-brand-primary/50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-standard"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                  📦 {collection.name}
                </h1>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {collection.description || "No description provided."}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-standard shrink-0"
                title="Edit collection name and description"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meta Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Owner
            </p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              {activeWorkspace?.ownerUsername || "Anonymous"}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Created
            </p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              {formattedCreatedDate}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-success/10 text-brand-success">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Folders
            </p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              {folderCount}
            </p>
          </div>
        </div>
      </div>

      {/* Environment Manager Section */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-brand-primary" />
            Environments & Variables
          </h2>
          <p className="text-[11px] text-slate-400">
            Define environment configurations and scoping variables for
            interpolation scripts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <EnvironmentScopeList
            collectionId={activeCollectionId!}
            onAddClick={() => setShowAddEnvModal(true)}
          />
          <VariableMatrixGrid collectionId={activeCollectionId!} />
        </div>
      </div>

      <CreateEnvironmentModal
        isOpen={showAddEnvModal}
        onClose={() => setShowAddEnvModal(false)}
        collectionId={activeCollectionId!}
      />
    </div>
  );
}
