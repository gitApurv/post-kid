import { useState } from "react";
import { Calendar, Trash2, Info, Loader2 } from "lucide-react";
import type HistoryListProps from "../types/props/HistoryListProps";
import useHistoryStore from "../store/HistoryStore";
import HistoryService from "../service/HistoryService";

export default function HistoryList({ items, onInspect }: HistoryListProps) {
  const removeHistory = useHistoryStore((state) => state.removeHistory);

  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-blue-400 border-blue-500/20 bg-blue-500/10";
      case "POST":
        return "text-brand-success border-brand-success/20 bg-brand-success/10";
      case "PUT":
        return "text-brand-warning border-brand-warning/20 bg-brand-warning/10";
      case "DELETE":
        return "text-brand-error border-brand-error/20 bg-brand-error/10";
      case "PATCH":
        return "text-purple-400 border-purple-500/20 bg-purple-500/10";
      default:
        return "text-slate-400 border-slate-500/20 bg-slate-500/10";
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-brand-success bg-brand-success/5 border-brand-success/10";
    if (code >= 300 && code < 400)
      return "text-blue-400 bg-blue-500/5 border-blue-500/10";
    return "text-brand-error bg-brand-error/5 border-brand-error/10";
  };

  const getStatusText = (code: number) => {
    switch (code) {
      case 200:
        return "OK";
      case 201:
        return "Created";
      case 202:
        return "Accepted";
      case 204:
        return "No Content";
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 500:
        return "Internal Server Error";
      default:
        return code >= 200 && code < 300 ? "Success" : "Error";
    }
  };

  const formatSize = (body: string) => {
    const bytes = (body || "").length;
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingIds[id]) return;
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    setError(null);
    const response = await HistoryService.deleteHistory(id);
    if (response.success) {
      removeHistory(id);
    } else {
      setError(response.error || "Failed to delete history item.");
      setDeletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="relative pl-8 sm:pl-12 py-4">
      {/* Central glowing vertical timeline rail axis line */}
      <div className="absolute left-[15px] sm:left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-primary/30 via-slate-800 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.08)]" />

      {error && (
        <div className="mb-6 text-[11px] text-brand-error bg-brand-error/5 border border-brand-error/20 rounded-lg p-2.5 max-w-xl mx-auto md:mx-2 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-bold px-1.5 py-0.5 hover:bg-white/5 rounded"
          >
            Clear
          </button>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="relative mb-8 last:mb-0 group animate-pulse-slow"
        >
          {/* Axis Node bullet status ring */}
          <div
            className={`absolute left-[-24px] sm:left-[-32px] top-3.5 w-4 h-4 rounded-full bg-[#07090E] border-2 flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-125 ${
              item.statusCode >= 200 && item.statusCode < 300
                ? "border-brand-success shadow-[0_0_6px_#10B981]"
                : item.statusCode >= 500
                  ? "border-brand-error shadow-[0_0_6px_#F43F5E]"
                  : "border-brand-warning shadow-[0_0_6px_#F59E0B]"
            }`}
          />

          {/* Right-aligned details card — clicking anywhere opens inspector */}
          <div
            onClick={() => onInspect(item)}
            className="glass-panel rounded-xl p-4 ml-2 border border-white/5 bg-[#0B0F19]/40 hover:bg-[#0B0F19]/90 hover:border-white/10 hover:shadow-2xl transition-all duration-200 hover:scale-[1.005] select-text flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
          >
            {/* Method & URL information */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full ${getMethodColor(item.method)}`}
                >
                  {item.method}
                </span>

                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full ${getStatusColor(item.statusCode)}`}
                >
                  {item.statusCode} {getStatusText(item.statusCode)}
                </span>

                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.executedAt}
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 break-all select-all">
                {item.url}
              </p>
            </div>

            {/* Latency parameters & Overlay quick actions */}
            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
              <div className="text-right text-xs">
                <p className="font-semibold text-slate-300 font-mono">
                  {item.durationMs} ms
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {formatSize(item.responseBody)}
                </p>
              </div>

              {/* Actions group */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={deletingIds[item.id]}
                  className="p-2 bg-white/[0.02] hover:bg-brand-error/15 border border-white/5 hover:border-brand-error/20 text-slate-500 hover:text-brand-error rounded-lg transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Delete entry"
                >
                  {deletingIds[item.id] ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-error" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-xl text-slate-500 italic max-w-xl mx-auto flex flex-col items-center justify-center gap-2">
          <Info className="w-8 h-8 text-slate-700 animate-float" />
          No execution history found.
        </div>
      )}
    </div>
  );
}
