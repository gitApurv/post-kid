import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import useEnvironmentStore from "../store/EnvironmentStore";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import EnvironmentService from "../service/EnvironmentService";
import type EnvironmentScopeListProps from "../types/props/EnvironmentScopeListProps";

export default function EnvironmentScopeList({
  collectionId,
  onAddClick,
}: EnvironmentScopeListProps) {
  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore(
    (state) => state.activeEnvironmentId,
  );
  const setActiveEnvironment = useEnvironmentStore(
    (state) => state.setActiveEnvironmentId,
  );
  const removeEnvironmentState = useEnvironmentStore(
    (state) => state.removeEnvironment,
  );
  const fetchEnvironments = useEnvironmentStore(
    (state) => state.fetchEnvironmentsAction,
  );

  useEffect(() => {
    const loadEnvironments = async () => {
      const response = await fetchEnvironments(collectionId);
      if (response && !response.success) {
        alert(response.error || "Failed to fetch environments.");
      }
    };
    loadEnvironments();
  }, [fetchEnvironments, collectionId]);

  const handleDeleteEnv = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete environment '${name}'?`,
      )
    ) {
      const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!workspaceId) return;
      const res = await EnvironmentService.deleteEnvironment(
        workspaceId,
        collectionId,
        id,
      );
      if (res.success) {
        removeEnvironmentState(id);
      } else {
        alert(res.error || "Failed to delete environment.");
      }
    }
  };

  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="glass-panel rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Scope Keys
          </span>
          <button
            onClick={onAddClick}
            className="p-1 hover:bg-white/5 rounded text-brand-primary hover:text-brand-secondary transition-standard cursor-pointer"
            title="Create Environment"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {Object.values(environments).map((environment) => {
            const isActive = environment.id === activeEnvironmentId;

            return (
              <div
                key={environment.id}
                onClick={() => setActiveEnvironment(environment.id)}
                className={`group w-full flex items-center justify-between px-3 py-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0B0F19] border-brand-success shadow-[0_0_12px_rgba(16,185,129,0.06)]"
                    : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      environment.color === "EMERALD"
                        ? "bg-brand-success shadow-[0_0_6px_#10B981]"
                        : environment.color === "AMBER"
                          ? "bg-brand-warning shadow-[0_0_6px_#F59E0B]"
                          : environment.color === "BLUE"
                            ? "bg-blue-500 shadow-[0_0_6px_#3B82F6]"
                            : environment.color === "ROSE"
                              ? "bg-rose-500 shadow-[0_0_6px_#F43F5E]"
                              : "bg-slate-400 shadow-[0_0_6px_#94A3B8]"
                    } ${isActive ? "animate-pulse" : ""}`}
                  />
                  <span
                    className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-slate-400"}`}
                  >
                    {environment.name}
                  </span>
                </div>

                {/* Deletion action showing only on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEnv(environment.id, environment.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer"
                  title="Delete Environment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
