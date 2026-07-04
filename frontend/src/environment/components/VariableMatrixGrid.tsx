import { useState, useMemo } from "react";
import { Trash2, FolderPlus, Edit3 } from "lucide-react";
import useEnvironmentStore from "../store/EnvironmentStore";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import EnvironmentService from "../service/EnvironmentService";

export default function VariableMatrixGrid({
  collectionId,
}: {
  collectionId: string;
}) {
  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore(
    (state) => state.activeEnvironmentId,
  );
  const upsertEnvironment = useEnvironmentStore(
    (state) => state.upsertEnvironment,
  );
  const upsertVariable = useEnvironmentStore((state) => state.upsertVariable);
  const removeVariable = useEnvironmentStore((state) => state.removeVariable);

  const activeEnv = activeEnvironmentId
    ? environments[activeEnvironmentId]
    : Object.values(environments)[0];

  const [editingValues, setEditingValues] = useState<{
    index: number;
    key: string;
    value: string;
  } | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const [prevEnvId, setPrevEnvId] = useState<string | undefined>(activeEnv?.id);
  const [prevEnvName, setPrevEnvName] = useState<string | undefined>(
    activeEnv?.name,
  );

  if (activeEnv?.id !== prevEnvId || activeEnv?.name !== prevEnvName) {
    setPrevEnvId(activeEnv?.id);
    setPrevEnvName(activeEnv?.name);
    if (activeEnv) {
      setEditName(activeEnv.name);
      setIsEditingName(false);
    }
  }

  // Convert the variables Record to a stable array for indexed grid rendering
  const filteredVariables = useMemo(() => {
    return Object.values(activeEnv?.variables ?? {});
  }, [activeEnv?.variables]);

  const phantomRow = useMemo(() => ({ id: "phantom", key: "", value: "" }), []);

  const displayVariables = useMemo(() => {
    const list = [...filteredVariables, phantomRow];
    const phantomIndex = filteredVariables.length;
    if (editingValues && editingValues.index === phantomIndex) {
      if (
        editingValues.key.trim() !== "" ||
        editingValues.value.trim() !== ""
      ) {
        list.push({ id: "phantom-next", key: "", value: "" });
      }
    }
    return list;
  }, [filteredVariables, editingValues, phantomRow]);

  const handleSaveEnvName = async () => {
    if (!activeEnv) return;
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName === activeEnv.name) {
      setEditName(activeEnv.name);
      setIsEditingName(false);
      return;
    }

    const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!workspaceId) return;

    const res = await EnvironmentService.editEnvironment(
      workspaceId,
      collectionId,
      activeEnv.id,
      {
        name: trimmedName,
        environmentColor: activeEnv.color,
      },
    );

    if (res.success && res.data) {
      // Rebuild variables as Record to preserve the normalized shape
      const variables: typeof activeEnv.variables = {};
      res.data.variables.forEach((v) => {
        variables[v.id] = { id: v.id, key: v.key, value: v.value };
      });
      upsertEnvironment({
        id: res.data.id,
        name: res.data.name,
        color: res.data.environmentColor,
        variables,
      });
    } else if (!res.success) {
      alert(res.error || "Failed to update environment name.");
      setEditName(activeEnv.name);
    }
    setIsEditingName(false);
  };

  const handleInputChange = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    const isPhantomRow = index >= filteredVariables.length;
    const originalVar = isPhantomRow
      ? { key: "", value: "" }
      : filteredVariables[index];

    setEditingValues((prev) => {
      if (prev && prev.index === index) {
        return { ...prev, [field]: newValue };
      }
      return {
        index,
        key: field === "key" ? newValue : originalVar.key,
        value: field === "value" ? newValue : originalVar.value,
      };
    });
  };

  const handleSaveRow = async (index: number) => {
    if (!activeEnv || !editingValues || editingValues.index !== index) return;

    const { key, value } = editingValues;
    const isPhantomRow = index >= filteredVariables.length;

    if (!key.trim() && !value.trim()) {
      setEditingValues(null);
      return;
    }

    let response: { success: boolean; error?: string } | undefined;
    const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!workspaceId) return;
    if (isPhantomRow) {
      const res = await EnvironmentService.addVariable(
        workspaceId,
        collectionId,
        activeEnv.id,
        {
          key: key.trim(),
          value: value.trim(),
        },
      );
      if (res.success && res.data) {
        upsertVariable(activeEnv.id, {
          id: res.data.id,
          key: res.data.key,
          value: res.data.value,
        });
      }
      response = res;
    } else {
      const targetVar = filteredVariables[index];
      if (key !== targetVar.key || value !== targetVar.value) {
        const res = await EnvironmentService.updateVariable(
          workspaceId,
          collectionId,
          activeEnv.id,
          targetVar.id,
          { key: key.trim(), value: value.trim() },
        );
        if (res.success && res.data) {
          upsertVariable(activeEnv.id, {
            id: res.data.id,
            key: res.data.key,
            value: res.data.value,
          });
        }
        response = res;
      }
    }
    if (response && !response.success) {
      alert(response.error || "Failed to save variable.");
    }
    setEditingValues(null);
  };

  const handleDeleteGridRow = async (index: number) => {
    if (!activeEnv) return;
    const isPhantomRow = index >= filteredVariables.length;
    if (isPhantomRow) {
      setEditingValues(null);
    } else {
      const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!workspaceId || index >= filteredVariables.length) return;
      const targetVar = filteredVariables[index];
      const res = await EnvironmentService.deleteVariable(
        workspaceId,
        collectionId,
        activeEnv.id,
        targetVar.id,
      );
      if (res.success) {
        removeVariable(activeEnv.id, targetVar.id);
      } else {
        alert(res.error || "Failed to delete variable.");
      }
    }
  };

  if (Object.keys(environments).length === 0) {
    return (
      <div className="lg:col-span-3">
        <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] border border-white/5 space-y-3 animate-float">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold font-display text-white">
            No Active Scope
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Create Environment to start adding variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0 group">
              <h2 className="text-sm font-semibold font-display text-white shrink-0">
                Variables Grid:
              </h2>
              {isEditingName ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEnvName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEnvName();
                    } else if (e.key === "Escape") {
                      setIsEditingName(false);
                      setEditName(activeEnv?.name ?? "");
                    }
                  }}
                  autoFocus
                  className="bg-brand-layer-2 border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-brand-primary max-w-[200px]"
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs font-bold text-slate-300 tracking-wide hover:text-white cursor-pointer truncate max-w-[250px] flex items-center gap-1 hover:bg-white/5 px-1.5 py-0.5 rounded transition-standard text-left"
                  title="Click to edit environment name"
                >
                  {activeEnv?.name || "Active Environment"}
                  <Edit3 className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Editable matrix syncing instantly with URL interpolation scripts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-2">Variable Key</th>
                <th className="py-2.5 px-2">Value</th>
                <th className="py-2.5 px-2 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayVariables.map((variable, index) => {
                return (
                  <tr
                    key={index}
                    className="hover:bg-white/[0.01] transition-standard"
                  >
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        value={
                          editingValues && editingValues.index === index
                            ? editingValues.key
                            : variable.key
                        }
                        onChange={(e) =>
                          handleInputChange(index, "key", e.target.value)
                        }
                        onBlur={() => handleSaveRow(index)}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/50 focus:ring-0 text-slate-200 font-mono text-[11px] py-1 px-1 focus:outline-none placeholder-slate-600"
                        placeholder="KEY_NAME"
                      />
                    </td>

                    <td className="py-2 px-1 relative">
                      <div className="flex items-center gap-1.5 pr-6">
                        <input
                          type="text"
                          value={
                            editingValues && editingValues.index === index
                              ? editingValues.value
                              : variable.value
                          }
                          onChange={(e) =>
                            handleInputChange(index, "value", e.target.value)
                          }
                          onBlur={() => handleSaveRow(index)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/50 focus:ring-0 font-mono text-[11px] py-1 px-1 focus:outline-none placeholder-slate-600 transition-all duration-300 text-brand-success"
                          placeholder="Variable value"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-1 text-right">
                      {index < filteredVariables.length ||
                      (editingValues &&
                        editingValues.index === index &&
                        (editingValues.key.trim() !== "" ||
                          editingValues.value.trim() !== "")) ? (
                        <button
                          onClick={() => handleDeleteGridRow(index)}
                          className="p-1 hover:bg-brand-error/10 text-slate-600 hover:text-brand-error rounded transition-standard cursor-pointer"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
