import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trash2,
  Clock,
  Globe,
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  Loader2,
} from "lucide-react";
import type HistoryInspectorModalProps from "../types/props/HistoryInspectorModalProps";
import useHistoryStore from "../store/HistoryStore";
import HistoryService from "../service/HistoryService";

export default function HistoryInspectorModal({
  item,
  onClose,
}: HistoryInspectorModalProps) {
  const removeHistory = useHistoryStore((state) => state.removeHistory);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    setError(null);
    setIsLoading(false);
  }

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

  const formatHeaders = (headers: unknown) => {
    if (!headers) return "None";
    let parsed: unknown = headers;
    if (typeof headers === "string") {
      try {
        parsed = JSON.parse(headers) as unknown;
      } catch {
        return headers;
      }
    }
    if (!parsed || typeof parsed !== "object") {
      return "None";
    }
    const entries = Object.entries(parsed as Record<string, unknown>);
    if (entries.length === 0) {
      return "None";
    }
    return entries.map(([k, v]) => `${k}: ${String(v)}`).join("\n");
  };

  const formatBody = (body: unknown) => {
    if (!body) return "";
    try {
      if (typeof body === "object") {
        return JSON.stringify(body, null, 2);
      }
      if (typeof body === "string") {
        const parsed = JSON.parse(body) as unknown;
        return JSON.stringify(parsed, null, 2);
      }
      return String(body);
    } catch {
      return String(body);
    }
  };

  const getAuthValueObject = (val: unknown) => {
    if (!val) return null;
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as Record<string, string>;
      } catch {
        return null;
      }
    }
    return val as Record<string, string>;
  };

  const handleDelete = async () => {
    if (!item || isLoading) return;
    setIsLoading(true);
    setError(null);
    const res = await HistoryService.deleteHistory(item.id);
    if (res.success) {
      removeHistory(item.id);
      onClose();
    } else {
      setError(res.error || "Failed to delete history item.");
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] border border-white/10 animate-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-90" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h3 className="text-sm font-semibold font-display text-white">
            History Inspector
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-standard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs custom-scrollbar">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg font-mono">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                Method
              </p>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getMethodColor(item.method)}`}
              >
                {item.method}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                Status
              </p>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getStatusColor(item.statusCode)}`}
              >
                {item.statusCode}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                Duration
              </p>
              <p className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-primary" />
                {item.durationMs} ms
              </p>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" /> Target URL
            </p>
            <div className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 break-all select-all">
              {item.url}
            </div>
          </div>

          {/* Executed At */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Executed At
            </p>
            <div className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300">
              {item.executedAt}
            </div>
          </div>

          {/* Request section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpFromLine className="w-3 h-3 text-brand-primary" /> Request
            </p>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Headers</p>
              <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                {formatHeaders(item.requestHeaders)}
              </pre>
            </div>

            {item.requestBody && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Body</p>
                <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-40">
                  {formatBody(item.requestBody)}
                </pre>
              </div>
            )}
          </div>

          {/* Response section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownToLine className="w-3 h-3 text-brand-primary" />{" "}
              Response
            </p>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Headers</p>
              <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                {formatHeaders(item.responseHeaders)}
              </pre>
            </div>

            {item.responseBody && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Body</p>
                <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-40">
                  {formatBody(item.responseBody)}
                </pre>
              </div>
            )}

            {item.errorMessage && (
              <div className="space-y-1">
                <p className="text-[10px] text-brand-error uppercase font-bold">
                  Error
                </p>
                <div className="p-3 bg-brand-error/5 border border-brand-error/20 rounded-lg font-mono text-[10px] text-brand-error select-all">
                  {item.errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* Metadata section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3 h-3 text-brand-primary" /> Metadata
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">
                  Auth Type
                </p>
                <div className="p-2 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-400">
                  {!item.authType || item.authType.toLowerCase() === "none"
                    ? "None"
                    : item.authType.charAt(0).toUpperCase() +
                      item.authType.slice(1)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Timeout</p>
                <div className="p-2 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-400">
                  {item.timeoutSeconds}s
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Success</p>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold font-mono border ${item.success ? "text-brand-success bg-brand-success/5 border-brand-success/20" : "text-brand-error bg-brand-error/5 border-brand-error/20"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${item.success ? "bg-brand-success" : "bg-brand-error"}`}
                />
                {item.success ? "true" : "false"}
              </div>
            </div>

            {item.authType &&
              item.authType.toLowerCase() !== "none" &&
              item.authValue &&
              (() => {
                const authObj = getAuthValueObject(item.authValue);
                if (
                  !authObj ||
                  typeof authObj !== "object" ||
                  Object.keys(authObj).length === 0
                )
                  return null;
                return (
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase">
                      Auth Value
                    </p>
                    <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                      {JSON.stringify(authObj, null, 2)}
                    </pre>
                  </div>
                );
              })()}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div>
            {error && (
              <span className="text-xs text-brand-error font-medium">
                {error}
              </span>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-brand-error/10 hover:bg-brand-error border border-brand-error/20 hover:border-brand-error text-brand-error hover:text-white font-semibold rounded-lg transition-standard text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isLoading ? "Deleting..." : "Delete Entry"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
