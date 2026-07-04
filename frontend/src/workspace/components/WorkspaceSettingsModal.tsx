import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Settings,
  Users,
  UserPlus,
  LogOut,
} from "lucide-react";
import md5 from "blueimp-md5";
import useWorkspaceStore from "../store/WorkspaceStore";
import useAuthStore from "../../auth/store/AuthStore";
import WorkspaceService from "../service/WorkspaceService";
import type MemberResponse from "../types/response/MemberResponse";
import type { WorkspaceRole } from "../types/response/MemberResponse";
import type ModalProps from "../../common/types/ModalProps";

export type WorkspaceSettingsModalProps = ModalProps;

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
}: WorkspaceSettingsModalProps) {
  const {
    workspaces,
    activeWorkspaceId,
    createWorkspaceAction,
    deleteWorkspaceAction,
    setActiveWorkspaceAction,
    upsertWorkspace,
    updateMemberCount,
    removeWorkspace,
  } = useWorkspaceStore();

  const { currentUser } = useAuthStore();

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(
    null,
  );
  const [membersMap, setMembersMap] = useState<
    Record<string, MemberResponse[]>
  >({});
  const [loadingMembers, setLoadingMembers] = useState<Record<string, boolean>>(
    {},
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || isCreating) return;

    setIsCreating(true);
    setErrorMsg("");

    const res = await createWorkspaceAction({
      name: newWorkspaceName.trim(),
      description: newWorkspaceDescription.trim() || undefined,
    });

    if (res.success) {
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setIsCreating(false);
    } else {
      setErrorMsg(res.error || "Failed to create workspace.");
      setIsCreating(false);
    }
  };

  const handleStartEdit = (id: string, name: string, desc: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditDescription(desc || "");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || isSaving) return;

    setIsSaving(true);
    const res = await WorkspaceService.updateWorkspace(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });

    if (res.success && res.data) {
      upsertWorkspace({
        ...workspaces[id],
        name: res.data.name,
        description: res.data.description || "",
      });
      setEditingId(null);
      setIsSaving(false);
    } else {
      alert(res.error || "Failed to update workspace.");
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete workspace "${name}"?`,
      )
    ) {
      const res = await deleteWorkspaceAction(id);
      if (!res.success) {
        alert(res.error || "Failed to delete workspace.");
      }
    }
  };

  const handleToggleMembers = async (workspaceId: string) => {
    if (expandedWorkspaceId === workspaceId) {
      setExpandedWorkspaceId(null);
      return;
    }

    setInviteEmail("");
    setInviteRole("MEMBER");

    setLoadingMembers((prev) => ({ ...prev, [workspaceId]: true }));
    const res = await WorkspaceService.fetchMembers(workspaceId);
    if (res.success && res.data) {
      setMembersMap((prev) => ({ ...prev, [workspaceId]: res.data! }));
      setExpandedWorkspaceId(workspaceId);
    } else {
      alert(res.error || "Failed to fetch workspace members.");
    }
    setLoadingMembers((prev) => ({ ...prev, [workspaceId]: false }));
  };

  const handleInvite = async (e: React.FormEvent, workspaceId: string) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    setIsInviting(true);
    const res = await WorkspaceService.inviteMember(workspaceId, {
      email: inviteEmail.trim(),
      role: inviteRole,
    });

    if (res.success && res.data) {
      setMembersMap((prev) => ({
        ...prev,
        [workspaceId]: [...(prev[workspaceId] || []), res.data!],
      }));
      updateMemberCount(workspaceId, 1);
      setInviteEmail("");
      setInviteRole("MEMBER");
    } else {
      alert(res.error || "Failed to invite member.");
    }
    setIsInviting(false);
  };

  const handleRemoveMember = async (
    workspaceId: string,
    userId: string,
    username: string,
    email: string,
  ) => {
    const isSelf =
      !userId ||
      (currentUser &&
        (currentUser.email === email || currentUser.name === username));
    const confirmMessage = isSelf
      ? "Are you sure you want to leave this workspace?"
      : `Are you sure you want to remove member "${username}" from this workspace?`;

    if (confirm(confirmMessage)) {
      const res = isSelf
        ? await WorkspaceService.leaveWorkspace(workspaceId)
        : await WorkspaceService.removeMember(workspaceId, userId);
      if (res.success) {
        if (isSelf) {
          removeWorkspace(workspaceId);
          let nextActiveId = useWorkspaceStore.getState().activeWorkspaceId;
          if (nextActiveId === workspaceId) {
            const remaining = Object.keys(workspaces).filter(
              (id) => id !== workspaceId,
            );
            nextActiveId = remaining[0] ?? null;
          }
          await setActiveWorkspaceAction(nextActiveId);
        } else {
          setMembersMap((prev) => ({
            ...prev,
            [workspaceId]: (prev[workspaceId] || []).filter(
              (m) => m.userId !== userId,
            ),
          }));
          updateMemberCount(workspaceId, -1);
        }
      } else {
        alert(
          res.error ||
            (isSelf
              ? "Failed to leave workspace."
              : "Failed to remove member."),
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative flex flex-col max-h-[85vh] animate-float z-10 border border-white/10">
        {/* Top card accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-90" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 shrink-0">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold font-display text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-primary" />
              Workspace Settings
            </h3>
            <p className="text-[10px] text-slate-400">
              Manage your API sandboxes, invite members, and configure
              collaboration scopes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-standard cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Workspaces List */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Workspaces
            </h4>
            <div className="space-y-3">
              {Object.values(workspaces).map((workspace) => {
                const isEditingThis = editingId === workspace.id;
                const isCurrentActive = workspace.id === activeWorkspaceId;
                const isMembersExpanded = expandedWorkspaceId === workspace.id;
                const workspaceMembers = membersMap[workspace.id] || [];
                const isMembersLoading = loadingMembers[workspace.id] || false;

                return (
                  <div
                    key={workspace.id}
                    onClick={() => {
                      if (!isCurrentActive && !isEditingThis) {
                        setActiveWorkspaceAction(workspace.id);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all duration-300 space-y-3.5 ${
                      !isCurrentActive && !isEditingThis
                        ? "cursor-pointer hover:border-brand-primary/30 hover:bg-brand-primary/[0.01]"
                        : ""
                    } ${
                      isCurrentActive
                        ? "bg-brand-primary/[0.03] border-brand-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.03)]"
                        : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                  >
                    {isEditingThis ? (
                      <div
                        className="space-y-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            Workspace Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            Description
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                            placeholder="Describe this API workspace..."
                          />
                        </div>
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-standard cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(workspace.id)}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] text-white rounded-lg transition-standard cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white truncate">
                              {workspace.name}
                            </span>
                            {workspace.isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-brand-primary/10 text-brand-primary border border-brand-primary/20 leading-none">
                                Default
                              </span>
                            )}
                            {isCurrentActive && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-brand-success/10 text-brand-success border border-brand-success/20 leading-none">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                            {workspace.description ||
                              "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1.5">
                            <span className="flex items-center gap-1 bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/5">
                              <Users className="w-3.5 h-3.5 text-brand-primary" />
                              {workspace.memberCount} member(s)
                            </span>
                            <span>•</span>
                            <span>
                              Owner:{" "}
                              <strong className="text-slate-400">
                                {workspace.ownerUsername}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleToggleMembers(workspace.id)}
                            disabled={isMembersLoading}
                            className={`p-1.5 rounded-lg transition-standard cursor-pointer ${
                              isMembersExpanded
                                ? "bg-brand-primary/10 text-brand-primary"
                                : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                            }`}
                            title="Manage Members"
                          >
                            {isMembersLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleStartEdit(
                                workspace.id,
                                workspace.name,
                                workspace.description,
                              )
                            }
                            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-standard cursor-pointer"
                            title="Edit Workspace"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!workspace.isDefault &&
                            (workspace.ownerUsername === currentUser?.name ? (
                              <button
                                onClick={() =>
                                  handleDelete(workspace.id, workspace.name)
                                }
                                className="p-1.5 hover:bg-brand-error/10 rounded-lg text-slate-400 hover:text-brand-error transition-standard cursor-pointer"
                                title="Delete Workspace"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    workspace.id,
                                    "",
                                    currentUser?.name || "",
                                    currentUser?.email || "",
                                  )
                                }
                                className="p-1.5 hover:bg-brand-error/10 rounded-lg text-slate-400 hover:text-brand-error transition-standard cursor-pointer"
                                title="Leave Workspace"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Members Collapsible Panel */}
                    {isMembersExpanded && (
                      <div
                        className="border-t border-white/5 pt-4 mt-3 space-y-4 pl-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Workspace Members
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/5 text-slate-300">
                              {workspaceMembers.length}
                            </span>
                          </div>
                        </div>

                        {isMembersLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Invite Form */}
                            <form
                              onSubmit={(e) => handleInvite(e, workspace.id)}
                              className="flex gap-2 items-center bg-brand-layer-2/30 p-2 rounded-lg border border-white/5 focus-within:border-brand-primary/40 transition-standard"
                            >
                              <input
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="collaborator@email.com"
                                className="block flex-1 min-w-0 px-3 py-1.5 bg-brand-layer-2 border border-white/5 rounded-md text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 transition-standard"
                              />
                              <select
                                value={inviteRole}
                                onChange={(e) =>
                                  setInviteRole(e.target.value as WorkspaceRole)
                                }
                                className="bg-brand-layer-2 border border-white/5 rounded-md text-[11px] text-slate-200 px-2 py-1.5 focus:outline-none focus:border-brand-primary/60 transition-standard"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="VIEWER">VIEWER</option>
                              </select>
                              <button
                                type="submit"
                                disabled={isInviting || !inviteEmail}
                                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-md text-[11px] font-semibold transition-standard cursor-pointer flex items-center gap-1 disabled:opacity-50 hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                              >
                                {isInviting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserPlus className="w-3.5 h-3.5" />
                                )}
                                Invite
                              </button>
                            </form>

                            {/* Members list */}
                            <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 custom-scrollbar divide-y divide-white/[0.02]">
                              {workspaceMembers.map((member) => (
                                <div
                                  key={member.userId}
                                  className="flex items-center justify-between text-xs py-2 px-2.5 hover:bg-white/[0.01] rounded-lg transition-standard first:pt-2"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Avatar Badge */}
                                    <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center overflow-hidden shrink-0 select-none">
                                      <img
                                        src={`https://www.gravatar.com/avatar/${md5(member.email.trim().toLowerCase())}?d=identicon`}
                                        alt={member.username}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-semibold text-slate-200 truncate">
                                          {member.username}
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border leading-none shrink-0 ${
                                            member.role === "ADMIN"
                                              ? "bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary"
                                              : member.role === "MEMBER"
                                                ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                                                : "bg-white/5 border-white/10 text-slate-400"
                                          }`}
                                        >
                                          {member.role}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Delete member button */}
                                  {workspace.ownerUsername !==
                                    member.username && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(
                                          workspace.id,
                                          member.userId,
                                          member.username,
                                          member.email,
                                        )
                                      }
                                      className="p-1.5 hover:bg-brand-error/15 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer shrink-0"
                                      title={
                                        currentUser &&
                                        (currentUser.email === member.email ||
                                          currentUser.name === member.username)
                                          ? "Leave Workspace"
                                          : "Remove Member"
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {workspaceMembers.length === 0 && (
                                <div className="text-[11px] text-slate-500 italic py-3 text-center">
                                  No members found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Workspace Form */}
          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 sm:p-5 mt-6 space-y-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold font-display text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-primary" />
                Create New Workspace
              </h4>
              <p className="text-[10px] text-slate-400">
                Setup a fresh, isolated sandbox for variables, collections, and
                team collaboration.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. Finance APIs"
                    className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                    placeholder="e.g. Sandbox for mock billing endpoints"
                    className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-brand-error bg-brand-error/10 border border-brand-error/20 rounded-lg p-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] text-white rounded-lg text-xs font-semibold transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
