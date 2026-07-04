import { Trash2 } from "lucide-react";
import type RequestTreeItemProps from "../types/props/RequestTreeItemProps";
import useRequestStore from "../../request/store/RequestStore";

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "POST":
      return "text-brand-success bg-brand-success/10 border-brand-success/20";
    case "PUT":
      return "text-brand-warning bg-brand-warning/10 border-brand-warning/20";
    case "DELETE":
      return "text-brand-error bg-brand-error/10 border-brand-error/20";
    case "PATCH":
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
};

export default function RequestTreeItem({
  request,
  onDelete,
}: RequestTreeItemProps) {
  const activeRequestId = useRequestStore((state) => state.activeRequestId);
  const setActiveRequestDirectlyAction = useRequestStore(
    (state) => state.setActiveRequestDirectlyAction,
  );

  const isActive = request.id === activeRequestId;

  return (
    <div
      onClick={async () => {
        const requestStore = useRequestStore.getState();
        const activeRequest = requestStore.activeRequest;
        if (activeRequest) {
          const savedRequest = requestStore.requests[activeRequest.id];
          if (savedRequest && activeRequest.url !== savedRequest.url) {
            await requestStore.updateActiveRequestAction({
              url: activeRequest.url,
            });
          }
        }
        setActiveRequestDirectlyAction(request);
      }}
      className={`group/req flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] cursor-pointer transition-standard relative ${
        isActive
          ? "bg-brand-primary/10 text-white font-semibold"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-brand-primary rounded-r" />
      )}

      <div className="flex items-center gap-2 truncate flex-1 pr-2">
        <span
          className={`text-[8px] font-bold font-mono px-1 py-0.5 border rounded leading-none shrink-0 ${getMethodColor(request.method)}`}
        >
          {request.method}
        </span>
        <span className="truncate">{request.name}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(request.id, request.name);
        }}
        className="opacity-0 group-hover/req:opacity-100 p-0.5 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer"
        title="Delete Request"
        aria-label={`Delete request ${request.name}`}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
