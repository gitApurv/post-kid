import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import type ModalProps from "../../common/types/ModalProps";
import useHistoryStore from "../store/HistoryStore";
import HistoryService from "../service/HistoryService";

export default function ClearHistoryModal({ isOpen, onClose }: ModalProps) {
  const clearHistories = useHistoryStore((state) => state.clearHistories);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }

  const handleClear = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    const response = await HistoryService.clearHistory();
    if (!response.success) {
      setError(response.error || "Failed to clear history.");
      setIsLoading(false);
      return;
    }
    clearHistories();
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center border border-white/10 animate-float">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-error opacity-90" />

        <div className="w-12 h-12 rounded-full bg-brand-error/10 border border-brand-error/20 flex items-center justify-center mx-auto mb-4 text-brand-error animate-pulse">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold font-display text-white mb-2">
          Prune History?
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This action deletes all locally cached dispatch variables and latency
          sparks. This operation is permanent.
        </p>

        {error && (
          <div className="text-xs text-brand-error bg-brand-error/10 border border-brand-error/20 rounded-lg p-3 flex items-center gap-2 mb-4 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 hover:bg-white/5 border border-white/5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-brand-error to-pink-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-[1.01] active:scale-[0.99] text-white rounded-lg text-xs font-semibold transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoading ? "Pruning..." : "Prune History"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
