import { useEffect, useState, useMemo } from "react";
import { History, Trash2, Loader2, AlertCircle } from "lucide-react";
import HistoryInspectorModal from "../components/HistoryInspectorModal";
import ClearHistoryModal from "../components/ClearHistoryModal";
import HistoryList from "../components/HistoryList";
import type HistoryItem from "../types/items/HistoryItem";
import useHistoryStore from "../store/HistoryStore";
import HistoryService from "../service/HistoryService";

export default function HistoryPage() {
  const historiesRecord = useHistoryStore((state) => state.histories);
  const upsertHistories = useHistoryStore((state) => state.upsertHistories);

  const histories = useMemo(() => {
    return Object.values(historiesRecord).sort(
      (a, b) =>
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
    );
  }, [historiesRecord]);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inspectItem, setInspectItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndStoreHistory = async () => {
    const res = await HistoryService.fetchHistories();
    if (res.success && res.data) {
      upsertHistories(res.data.content);
    } else {
      setError(res.error || "Failed to fetch history.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;
    HistoryService.fetchHistories().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        upsertHistories(res.data.content);
      } else {
        setError(res.error || "Failed to fetch history.");
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [upsertHistories]);

  return (
    <div className="space-y-6 font-sans relative p-6 h-full overflow-y-auto">
      {/* Header and Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-brand-primary" />
            Timeline Execution History
          </h1>
          <p className="text-xs text-slate-400">
            Timeline log auditing previously dispatched API request parameters.
          </p>
        </div>

        {histories.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 bg-brand-error/10 hover:bg-brand-error border border-brand-error/20 hover:border-brand-error text-brand-error hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-standard cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Log TIMELINES
          </button>
        )}
      </div>

      {/* Axis timeline grid / Loader / Error */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs">Loading execution history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-panel rounded-xl text-brand-error max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 animate-pulse text-brand-error" />
          <div className="space-y-1">
            <p className="text-xs font-semibold">Error Loading History</p>
            <p className="text-[11px] text-slate-400">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchAndStoreHistory();
            }}
            className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/20 hover:border-brand-primary text-brand-primary hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-standard"
          >
            Retry
          </button>
        </div>
      ) : (
        <HistoryList
          items={histories}
          onInspect={(item) => setInspectItem(item)}
        />
      )}

      {/* Prune confirmation modal */}
      <ClearHistoryModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      />

      {/* Detail Inspector Modal */}
      <HistoryInspectorModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
      />
    </div>
  );
}
