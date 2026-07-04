import { useState, useMemo, useEffect, useRef } from "react";
import {
  Send,
  Info,
  Layers,
  Unlock,
  Key,
  ShieldAlert,
  Sliders,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit3,
  ChevronDown,
} from "lucide-react";
import useRequestStore from "../store/RequestStore";
import type RequestItem from "../types/items/RequestItem";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";

const PHANTOM_ROW = { key: "", value: "", active: true };

export default function RequestBuilder() {
  const activeRequest = useRequestStore((state) => state.activeRequest);
  const isExecuting = useRequestStore((state) => state.isExecuting);
  const updateActiveRequestAction = useRequestStore(
    (state) => state.updateActiveRequestAction,
  );
  const updateActiveRequestFields = useRequestStore(
    (state) => state.updateActiveRequestFields,
  );
  const executeRequestAction = useRequestStore(
    (state) => state.executeRequestAction,
  );

  const handleUpdateRequest = async (fields: Partial<RequestItem>) => {
    const response = await updateActiveRequestAction(fields);
    if (response && !response.success) {
      alert(response.error || "Failed to update request details.");
    }
  };

  const storeParams = useMemo(
    () => activeRequest?.params || [],
    [activeRequest?.params],
  );
  const displayParams = useMemo(
    () => [...storeParams, PHANTOM_ROW],
    [storeParams],
  );

  const storeHeaders = useMemo(
    () => activeRequest?.headers || [],
    [activeRequest?.headers],
  );
  const displayHeaders = useMemo(
    () => [...storeHeaders, PHANTOM_ROW],
    [storeHeaders],
  );

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore(
    (state) => state.activeEnvironmentId,
  );
  const setActiveEnvironmentId = useEnvironmentStore(
    (state) => state.setActiveEnvironmentId,
  );

  const [activeTab, setActiveTab] = useState<
    "params" | "auth" | "headers" | "body" | "settings"
  >("params");
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [showResolvedUrl, setShowResolvedUrl] = useState(false);
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [localUrl, setLocalUrl] = useState("");

  const [prevRequestId, setPrevRequestId] = useState<string | undefined>(
    activeRequest?.id,
  );
  const [prevRequestUrl, setPrevRequestUrl] = useState<string | undefined>(
    activeRequest?.url,
  );

  if (
    activeRequest?.id !== prevRequestId ||
    activeRequest?.url !== prevRequestUrl
  ) {
    setPrevRequestId(activeRequest?.id);
    setPrevRequestUrl(activeRequest?.url);
    if (activeRequest) {
      setEditName(activeRequest.name);
      setIsEditingName(false);
      setLocalUrl(activeRequest.url);
    }
  }

  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const envDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!envDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        envDropdownRef.current &&
        !envDropdownRef.current.contains(e.target as Node)
      ) {
        setEnvDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnvDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [envDropdownOpen]);

  useEffect(() => {
    if (!methodDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        methodDropdownRef.current &&
        !methodDropdownRef.current.contains(e.target as Node)
      ) {
        setMethodDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMethodDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [methodDropdownOpen]);

  const activeEnvironment =
    environments[activeEnvironmentId] ?? Object.values(environments)[0];
  const activeVariables = Object.values(activeEnvironment?.variables ?? {});

  const getResolvedUrl = (rawUrl: string) => {
    let url = rawUrl;
    activeVariables.forEach((variable) => {
      url = url.replace(`{{${variable.key}}}`, variable.value);
    });
    return url;
  };

  const getMethodStyle = (method: RequestItem["method"]) => {
    switch (method) {
      case "GET":
        return {
          pill: "text-blue-400 border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/15 hover:border-blue-500/35",
          border:
            "focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/10 border-white/5",
          btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
          glow: "shadow-[0_0_40px_rgba(59,130,246,0.07)] border-blue-500/15",
        };
      case "POST":
        return {
          pill: "text-brand-success border-brand-success/25 bg-brand-success/10 hover:bg-brand-success/15 hover:border-brand-success/35",
          border:
            "focus-within:border-brand-success/40 focus-within:ring-4 focus-within:ring-brand-success/10 border-white/5",
          btn: "bg-brand-success hover:bg-brand-success/90 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white",
          glow: "shadow-[0_0_40px_rgba(16,185,129,0.07)] border-brand-success/15",
        };
      case "PUT":
        return {
          pill: "text-brand-warning border-brand-warning/25 bg-brand-warning/10 hover:bg-brand-warning/15 hover:border-brand-warning/35",
          border:
            "focus-within:border-brand-warning/40 focus-within:ring-4 focus-within:ring-brand-warning/10 border-white/5",
          btn: "bg-brand-warning hover:bg-brand-warning/90 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] text-white",
          glow: "shadow-[0_0_40px_rgba(245,158,11,0.07)] border-brand-warning/15",
        };
      case "DELETE":
        return {
          pill: "text-brand-error border-brand-error/25 bg-brand-error/10 hover:bg-brand-error/15 hover:border-brand-error/35",
          border:
            "focus-within:border-brand-error/40 focus-within:ring-4 focus-within:ring-brand-error/10 border-white/5",
          btn: "bg-brand-error hover:bg-brand-error/90 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] text-white",
          glow: "shadow-[0_0_40px_rgba(244,63,94,0.07)] border-brand-error/15",
        };
      case "PATCH":
        return {
          pill: "text-purple-400 border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15 hover:border-purple-500/35",
          border:
            "focus-within:border-purple-500/40 focus-within:ring-4 focus-within:ring-purple-500/10 border-white/5",
          btn: "bg-purple-500 hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] text-white",
          glow: "shadow-[0_0_40px_rgba(139,92,246,0.07)] border-purple-500/15",
        };
      default:
        return {
          pill: "text-slate-400 border-slate-500/25 bg-slate-500/10 hover:bg-slate-500/15 hover:border-slate-500/35",
          border:
            "focus-within:border-brand-primary/50 focus-within:ring-4 focus-within:ring-brand-primary/10 border-white/5",
          btn: "bg-brand-primary hover:bg-brand-secondary text-white",
          glow: "shadow-[0_0_40px_rgba(99,102,241,0.07)] border-white/7",
        };
    }
  };

  const currentStyles = getMethodStyle(activeRequest?.method || "GET");

  const handleSend = async () => {
    if (!activeRequest) return;
    const response = await executeRequestAction();
    if (response && !response.success) {
      alert(response.error || "Failed to execute request.");
    }
  };

  const handleGridChange = (
    type: "params" | "headers",
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    if (!activeRequest) return;
    const storeGrid = activeRequest[type] || [];
    const isPhantomRow = index === storeGrid.length;

    if (isPhantomRow) {
      const newRow = { key: "", value: "", active: true, [field]: value };
      handleUpdateRequest({ [type]: [...storeGrid, newRow] });
    } else {
      const grid = [...storeGrid];
      grid[index] = { ...grid[index], [field]: value };
      handleUpdateRequest({ [type]: grid });
    }
  };

  const handleToggleRowActive = (
    type: "params" | "headers",
    index: number,
    status: boolean,
  ) => {
    if (!activeRequest) return;
    const storeGrid = activeRequest[type] || [];
    if (index >= storeGrid.length) return;
    const grid = [...storeGrid];
    grid[index] = { ...grid[index], active: status };
    handleUpdateRequest({ [type]: grid });
  };

  const handleDeleteGridRow = (type: "params" | "headers", index: number) => {
    if (!activeRequest) return;
    const grid = activeRequest[type].filter((_, idx) => idx !== index);
    handleUpdateRequest({ [type]: grid });
  };

  const beautifyJson = () => {
    if (!activeRequest || activeRequest.bodyType !== "json") return;
    try {
      const parsed = JSON.parse(activeRequest.bodyJson);
      const beautified = JSON.stringify(parsed, null, 2);
      handleUpdateRequest({ bodyJson: beautified });
    } catch {
      alert(
        "Invalid JSON format. Check syntax parameters before indent alignment.",
      );
    }
  };

  const hasCurlyBraces = localUrl.includes("{{") && localUrl.includes("}}");

  if (!activeRequest) return null;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 space-y-4 flex flex-col h-[440px] z-10 shrink-0 transition-all duration-300 ${currentStyles.glow}`}
    >
      {/* Top API URL Builder strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0 group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
              Request Sandbox /
            </span>
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (
                    editName.trim() &&
                    editName.trim() !== activeRequest.name
                  ) {
                    handleUpdateRequest({ name: editName.trim() });
                  } else {
                    setEditName(activeRequest.name);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                    if (
                      editName.trim() &&
                      editName.trim() !== activeRequest.name
                    ) {
                      handleUpdateRequest({ name: editName.trim() });
                    } else {
                      setEditName(activeRequest.name);
                    }
                  } else if (e.key === "Escape") {
                    setIsEditingName(false);
                    setEditName(activeRequest.name);
                  }
                }}
                autoFocus
                className="bg-brand-layer-2 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-200 font-bold focus:outline-none focus:border-brand-primary max-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[10px] font-bold text-slate-300 tracking-widest hover:text-white cursor-pointer truncate max-w-[250px] flex items-center gap-1.5 hover:bg-white/[0.03] px-2 py-1 rounded-lg border border-white/5 transition-standard text-left"
                title="Click to edit request name"
              >
                {activeRequest.name}
                <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Environment Switcher */}
            <div className="relative" ref={envDropdownRef}>
              <button
                onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
                className="flex items-center gap-1.5 bg-brand-layer-2 border border-white/5 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:border-white/10 hover:bg-brand-layer-2/80 transition-standard cursor-pointer select-none"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${
                    activeEnvironment?.color === "EMERALD"
                      ? "bg-brand-success shadow-[0_0_6px_#10B981]"
                      : activeEnvironment?.color === "AMBER"
                        ? "bg-brand-warning shadow-[0_0_6px_#F59E0B]"
                        : activeEnvironment?.color === "BLUE"
                          ? "bg-blue-500 shadow-[0_0_6px_#3B82F6]"
                          : activeEnvironment?.color === "ROSE"
                            ? "bg-rose-500 shadow-[0_0_6px_#F43F5E]"
                            : "bg-slate-400 shadow-[0_0_6px_#94A3B8]"
                  }`}
                />
                <span>
                  {activeEnvironment ? activeEnvironment.name : "Select Env"}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${envDropdownOpen ? "rotate-180 text-slate-300" : ""}`}
                />
              </button>

              {envDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-brand-layer-1 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-white/5 pb-1 mb-1">
                    Environment
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                    {Object.values(environments).map((environment) => {
                      const isSelected = environment.id === activeEnvironmentId;
                      return (
                        <button
                          key={environment.id}
                          onClick={() => {
                            setActiveEnvironmentId(environment.id);
                            setEnvDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-standard flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-brand-primary/10 text-white font-medium border border-brand-primary/10"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
                          }`}
                        >
                          <span className="truncate text-[10px]">
                            {environment.name}
                          </span>
                          {isSelected && (
                            <span className="w-1 h-1 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Address bar container */}
      <div
        className={`flex items-center bg-brand-layer-2/40 border rounded-xl p-1.5 transition-all duration-300 ${currentStyles.border}`}
      >
        {/* Colored Pill Method Dropdown */}
        <div className="relative" ref={methodDropdownRef}>
          <button
            onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-standard cursor-pointer flex items-center gap-1.5 ${currentStyles.pill}`}
          >
            {activeRequest.method}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {methodDropdownOpen && (
            <div className="absolute top-11 left-0 bg-brand-layer-1 border border-white/10 rounded-lg shadow-2xl p-1.5 z-50 w-28">
              {(["GET", "POST", "PUT", "DELETE", "PATCH"] as const).map(
                (method) => (
                  <button
                    key={method}
                    onClick={() => {
                      handleUpdateRequest({ method: method });
                      setMethodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded transition-standard ${
                      method === activeRequest.method
                        ? "bg-brand-primary/10 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    {method}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* URL String Input */}
        <div className="flex-1 px-3 relative flex items-center min-w-0">
          <input
            type="text"
            value={showResolvedUrl ? getResolvedUrl(localUrl) : localUrl}
            onChange={(e) => {
              setLocalUrl(e.target.value);
              updateActiveRequestFields({ url: e.target.value });
            }}
            onBlur={() => {
              if (activeRequest && localUrl !== activeRequest.url) {
                handleUpdateRequest({ url: localUrl });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-transparent border-0 text-slate-200 text-xs font-mono py-1.5 focus:outline-none focus:ring-0 placeholder-slate-600"
            placeholder="{{base_url}}/endpoint"
            disabled={showResolvedUrl}
          />

          {/* Neon variable indicator highlighting */}
          {hasCurlyBraces && (
            <button
              onClick={() => setShowResolvedUrl(!showResolvedUrl)}
              className="absolute right-2 px-1.5 py-0.5 rounded bg-brand-success/10 text-brand-success border border-brand-success/20 text-[9px] font-bold flex items-center gap-1 hover:bg-brand-success/20 transition-standard cursor-pointer"
              title="Variables Interpolated"
            >
              <Sparkles className="w-3 h-3" />
              {"{{x}}"}
            </button>
          )}
        </div>

        {/* Pulsing Send trigger */}
        <button
          onClick={handleSend}
          disabled={isExecuting}
          className={`px-5 py-2.5 rounded-lg font-display text-xs font-bold text-white flex items-center gap-1.5 transition-standard cursor-pointer ${currentStyles.btn} disabled:opacity-40 disabled:pointer-events-none shrink-0`}
        >
          {isExecuting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Send
        </button>
      </div>

      {/* Resolved URL Variables Overlay tooltip */}
      {showResolvedUrl && hasCurlyBraces && (
        <div className="bg-[#0B0F19] border border-brand-success/20 p-2.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2 animate-float">
          <Info className="w-3.5 h-3.5 text-brand-success shrink-0" />
          <span className="text-slate-500 shrink-0">
            Compiler translates URL:
          </span>
          <span className="text-brand-success select-all">
            {getResolvedUrl(activeRequest.url)}
          </span>
        </div>
      )}

      {/* Segmented configuration tabs */}
      <div className="space-y-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center border-b border-white/5 text-xs font-semibold gap-1.5 shrink-0 pb-1.5">
          {(["params", "auth", "headers", "body", "settings"] as const).map(
            (tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2 capitalize transition-standard cursor-pointer text-xs font-semibold rounded-lg ${
                    isActive
                      ? "text-white bg-white/[0.03]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full shadow-[0_1px_4px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              );
            },
          )}
        </div>

        {/* Core tab panels */}
        <div className="flex-1 overflow-auto bg-brand-layer-1/25 rounded-xl border border-white/5 p-4 min-h-0 flex flex-col custom-scrollbar">
          {/* 1. Parameters grid builder */}
          {activeTab === "params" && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <Layers className="w-3.5 h-3.5" /> Query Parameters Grid
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 w-8 text-center">Active</th>
                    <th className="py-2.5 px-3">Key</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 w-12 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayParams.map((param, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/[0.01] transition-standard group/row"
                    >
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={param.active}
                          onChange={(e) =>
                            handleToggleRowActive(
                              "params",
                              index,
                              e.target.checked,
                            )
                          }
                          className="h-3.5 w-3.5 rounded border border-white/10 bg-brand-layer-2 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer transition-all"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) =>
                            handleGridChange(
                              "params",
                              index,
                              "key",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-200 font-mono text-[11px] py-1 focus:outline-none placeholder-slate-600 transition-all duration-150"
                          placeholder="Parameter key"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) =>
                            handleGridChange(
                              "params",
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-400 font-mono text-[11px] py-1 focus:outline-none placeholder-slate-600 transition-all duration-150"
                          placeholder="Value mapping"
                        />
                      </td>
                      <td className="py-2 text-center">
                        {index < storeParams.length ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteGridRow("params", index)}
                            className="p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Authentication switcher config */}
          {activeTab === "auth" && (
            <div className="space-y-5 max-w-lg">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" /> Authorization Schemes
                </label>
                <select
                  value={activeRequest.authType}
                  onChange={(e) =>
                    handleUpdateRequest({
                      authType: e.target.value as RequestItem["authType"],
                    })
                  }
                  className="block w-full bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 p-2.5 focus:outline-none focus:border-brand-primary"
                >
                  <option value="none">No Auth (Implicit parameters)</option>
                  <option value="bearer">Bearer Token (Header injected)</option>
                  <option value="basic">
                    Basic Credentials (Base64 encrypted)
                  </option>
                </select>
              </div>

              {activeRequest.authType === "bearer" && (
                <div className="space-y-1 bg-white/[0.01] border border-white/5 p-3 rounded-lg">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Bearer Token
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={activeRequest.authValue.token || ""}
                      onChange={(e) =>
                        handleUpdateRequest({
                          authValue: {
                            ...activeRequest.authValue,
                            token: e.target.value,
                          },
                        })
                      }
                      placeholder="eyJhY2Nlc3NfdG9rZW4iOiJsaXZlX2FlZDM5..."
                      className="block w-full pr-10 pl-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary font-mono"
                    />
                    <Key className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Appends an{" "}
                    <span className="font-mono text-brand-primary">
                      Authorization: Bearer {"<token>"}
                    </span>{" "}
                    key headers context automatically.
                  </p>
                </div>
              )}

              {activeRequest.authType === "basic" && (
                <div className="space-y-3 bg-white/[0.01] border border-white/5 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Username
                      </label>
                      <input
                        type="text"
                        value={activeRequest.authValue.username || ""}
                        onChange={(e) =>
                          handleUpdateRequest({
                            authValue: {
                              ...activeRequest.authValue,
                              username: e.target.value,
                            },
                          })
                        }
                        placeholder="api_key_id"
                        className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Password
                      </label>
                      <input
                        type="password"
                        value={activeRequest.authValue.password || ""}
                        onChange={(e) =>
                          handleUpdateRequest({
                            authValue: {
                              ...activeRequest.authValue,
                              password: e.target.value,
                            },
                          })
                        }
                        placeholder="••••••••"
                        className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Headers grid builder */}
          {activeTab === "headers" && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <Layers className="w-3.5 h-3.5" /> API Request Headers Grid
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 w-8 text-center">Active</th>
                    <th className="py-2.5 px-3">Header Key</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 w-12 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayHeaders.map((header, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/[0.01] transition-standard group/row"
                    >
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={header.active}
                          onChange={(e) =>
                            handleToggleRowActive(
                              "headers",
                              index,
                              e.target.checked,
                            )
                          }
                          className="h-3.5 w-3.5 rounded border border-white/10 bg-brand-layer-2 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer transition-all"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) =>
                            handleGridChange(
                              "headers",
                              index,
                              "key",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-200 font-mono text-[11px] py-1 focus:outline-none placeholder-slate-600 transition-all duration-150"
                          placeholder="Header key (e.g. Content-Type)"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) =>
                            handleGridChange(
                              "headers",
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-400 font-mono text-[11px] py-1 focus:outline-none placeholder-slate-600 transition-all duration-150"
                          placeholder="Value"
                        />
                      </td>
                      <td className="py-2 text-center">
                        {index < storeHeaders.length ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteGridRow("headers", index)
                            }
                            className="p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. JSON Monaco-style body editor */}
          {activeTab === "body" && (
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  <Sliders className="w-3.5 h-3.5" /> Body payload configuration
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                    application/json
                  </span>
                  <button
                    onClick={beautifyJson}
                    className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 px-2.5 py-1 rounded text-[9px] font-semibold text-slate-300 transition-standard cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-brand-primary" />
                    Beautify JSON
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-[#060814]/40 border border-white/5 rounded-lg flex overflow-hidden">
                <div className="w-9 border-r border-white/5 text-right select-none py-3 pr-2.5 text-slate-600 font-mono text-[10px] bg-[#060814]/20">
                  {Array.from({
                    length: Math.max(
                      1,
                      (activeRequest.bodyJson || "").split("\n").length,
                    ),
                  }).map((_, i) => (
                    <div key={i} className="h-5 leading-5">
                      {i + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={activeRequest.bodyJson || ""}
                  onChange={(e) =>
                    handleUpdateRequest({
                      bodyJson: e.target.value,
                      bodyType: "json",
                    })
                  }
                  placeholder='{\n  "key": "value"\n}'
                  className="flex-1 bg-transparent p-3 text-xs font-mono text-emerald-400 focus:outline-none resize-none overflow-y-auto leading-5"
                />
              </div>
            </div>
          )}

          {/* 5. Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-white/5 pb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Outage & Timeout
                Parameters
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Request Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={activeRequest.timeoutMs ?? 5000}
                    onChange={(e) =>
                      handleUpdateRequest({
                        timeoutMs: Number(e.target.value) || 5000,
                      })
                    }
                    className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
