import { useState } from "react";
import { createPortal } from "react-dom";
import { FolderPlus, Loader2, X } from "lucide-react";
import type ModalProps from "../../common/types/ModalProps";
import useEnvironmentStore from "../store/EnvironmentStore";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import EnvironmentService from "../service/EnvironmentService";
import type { EnvironmentColor } from "../types/items/Environment";

export default function CreateEnvironmentModal({
  isOpen,
  onClose,
  collectionId,
}: ModalProps & { collectionId: string }) {
  const upsertEnvironment = useEnvironmentStore(
    (state) => state.upsertEnvironment,
  );
  const setActiveEnvironmentId = useEnvironmentStore(
    (state) => state.setActiveEnvironmentId,
  );

  const [newEnvName, setNewEnvName] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<EnvironmentColor>("EMERALD");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNewEnvName("");
      setSelectedColor("EMERALD");
      setError(null);
      setIsLoading(false);
    }
  }

  const handleAddEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!workspaceId) {
      setError("No active workspace selected.");
      setIsLoading(false);
      return;
    }

    const result = await EnvironmentService.addEnvironment(
      workspaceId,
      collectionId,
      {
        name: newEnvName.trim(),
        environmentColor: selectedColor,
      },
    );

    if (result.success && result.data) {
      upsertEnvironment({
        id: result.data.id,
        name: result.data.name,
        color: result.data.environmentColor,
        variables: Object.fromEntries(
          result.data.variables.map((v) => [
            v.id,
            { id: v.id, key: v.key, value: v.value },
          ]),
        ),
      });
      setActiveEnvironmentId(result.data.id);
      setNewEnvName("");
      setSelectedColor("EMERALD");
      setIsLoading(false);
      onClose();
    } else {
      setError(result.error || "Failed to create environment.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-float border border-white/10 z-10">
        {/* Top card accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-90" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-standard cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-semibold font-display text-white flex items-center gap-2 mb-1">
          <FolderPlus className="w-5 h-5 text-brand-primary" />
          Initialize Fresh Environment
        </h3>
        <p className="text-[10px] text-slate-400 mb-6">
          Create a scoping container for environment keys.
        </p>

        <form onSubmit={handleAddEnv} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
              Environment Name
            </label>
            <input
              type="text"
              required
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              placeholder="e.g. UAT Sandbox"
              className="block w-full px-3 py-2 bg-brand-layer-2/50 border border-white/5 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Environment Theme
              </label>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  selectedColor === "EMERALD"
                    ? "text-brand-success"
                    : selectedColor === "AMBER"
                      ? "text-brand-warning"
                      : selectedColor === "BLUE"
                        ? "text-blue-400"
                        : selectedColor === "ROSE"
                          ? "text-rose-400"
                          : "text-slate-400"
                }`}
              >
                {selectedColor.charAt(0) + selectedColor.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="flex items-center justify-between bg-brand-layer-2/30 p-3 rounded-xl border border-white/5">
              {(["EMERALD", "AMBER", "GREY", "BLUE", "ROSE"] as const).map(
                (color) => {
                  const colorMap = {
                    EMERALD:
                      "bg-brand-success shadow-[0_0_12px_rgba(16,185,129,0.25)]",
                    AMBER:
                      "bg-brand-warning shadow-[0_0_12px_rgba(245,158,11,0.25)]",
                    BLUE: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]",
                    ROSE: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
                    GREY: "bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.25)]",
                  };
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center border-2 ${
                        isSelected
                          ? "border-white scale-110 shadow-lg ring-2 ring-brand-primary/40"
                          : "border-transparent hover:scale-105 opacity-70 hover:opacity-100"
                      } ${colorMap[color]}`}
                      title={color.toUpperCase()}
                    />
                  );
                },
              )}
            </div>
          </div>

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
              className="px-4 py-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] text-white rounded-lg text-xs font-semibold transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading ? "Initializing..." : "Initialize Scope"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
