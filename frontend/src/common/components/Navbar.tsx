import { useState, useEffect, useRef } from "react";
import { ChevronDown, Layers2, Settings, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import WorkspaceSettingsModal from "../../workspace/components/WorkspaceSettingsModal";

export default function Navbar() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspace = useWorkspaceStore(
    (state) => state.setActiveWorkspaceAction,
  );
  const fetchWorkspaces = useWorkspaceStore(
    (state) => state.fetchWorkspacesAction,
  );

  const activeWorkspace = activeWorkspaceId
    ? workspaces[activeWorkspaceId]
    : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHistoryPage = location.pathname === "/history";

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <header className="h-14 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-2 font-display text-lg tracking-tight select-none">
            <Zap className="w-5 h-5 text-brand-primary fill-brand-primary/20 shrink-0 animate-pulse" />
            <span className="font-extrabold text-white">
              Collaborate, Test,
            </span>
            <span className="font-extrabold bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 bg-clip-text text-transparent">
              Ship with Confidence.
            </span>
          </div>
          {!isHistoryPage && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-brand-layer-2/40 border border-white/5 text-slate-300 hover:text-white hover:border-white/10 hover:bg-brand-layer-2/70 transition-standard cursor-pointer select-none shadow-[0_2px_10px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <Layers2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span className="text-[11px] font-semibold truncate max-w-[140px]">
                  {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-slate-300" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-brand-layer-1 border border-white/10 rounded-xl shadow-2xl p-1.5 z-30">
                  <div className="px-2.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-white/5 pb-1 mb-1">
                    Switch Workspace
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                    {Object.values(workspaces).map((w) => {
                      const isSelected = w.id === activeWorkspaceId;
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            setActiveWorkspace(w.id);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-standard flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-brand-primary/10 text-white font-medium border border-brand-primary/10"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
                          }`}
                        >
                          <span className="truncate text-xs">{w.name}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-white/5 my-1.5" />
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-standard cursor-pointer font-semibold"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Manage Workspaces
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
