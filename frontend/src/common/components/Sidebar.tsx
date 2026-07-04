import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Terminal,
} from "lucide-react";
import useAuthStore from "../../auth/store/AuthStore";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logoutAction = useAuthStore((state) => state.logoutAction);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Execution History", path: "/history", icon: History },
  ];

  const handleLogout = async () => {
    const response = await logoutAction();
    if (response && !response.success) {
      alert(
        response.error ||
          "Failed to log out correctly from server, but local session cleared.",
      );
    }
    navigate("/login");
  };

  return (
    <aside
      className={`glass-panel border-r border-white/5 bg-[#0B0F19]/90 relative flex flex-col justify-between z-30 transition-all duration-300 ease-in-out ${
        sidebarExpanded ? "w-64" : "w-18"
      }`}
    >
      <div>
        {/* Header Branding */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
          <Link
            to="/"
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            {sidebarExpanded && (
              <span className="font-display font-bold text-base tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:text-brand-primary transition-standard">
                PostKid
              </span>
            )}
          </Link>

          {sidebarExpanded && (
            <button
              onClick={() => setSidebarExpanded(false)}
              className="p-1 hover:bg-white/5 rounded-md text-slate-400 hover:text-slate-200 transition-standard cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links List */}
        <nav className="p-3 space-y-1.5 relative">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${
                  isActive
                    ? "bg-brand-primary/10 text-white font-medium shadow-[inset_0_0_12px_rgba(99,102,241,0.06)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
              >
                {/* Vertical sliding neon highlight on left */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-primary shadow-[0_0_8px_#6366F1]" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-standard group-hover:scale-110 ${
                    isActive ? "text-brand-primary" : ""
                  }`}
                />

                {sidebarExpanded ? (
                  <span className="truncate">{item.name}</span>
                ) : (
                  /* Floating hover tooltips for collapsed sidebar */
                  <div className="absolute left-16 px-2.5 py-1.5 bg-brand-layer-2 border border-white/5 rounded-md text-xs font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapsed toggle and workspace profile footer */}
      <div className="border-t border-white/5 p-3 space-y-2">
        {!sidebarExpanded && (
          <button
            onClick={() => setSidebarExpanded(true)}
            className="w-full flex items-center justify-center p-2.5 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg transition-standard cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg transition-standard ${
              sidebarExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-brand-primary/30 flex items-center justify-center overflow-hidden text-xs">
              {currentUser?.avatar && currentUser.avatar.startsWith("http") ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.avatar || "🐐"
              )}
            </div>
            {sidebarExpanded && (
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {currentUser?.name || "Developer"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentUser?.email || "dev@postkid.com"}
                </p>
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="absolute bottom-12 left-2 w-48 bg-brand-layer-2 border border-white/10 rounded-lg shadow-2xl p-1.5 z-50 animate-float">
              <div className="px-2.5 py-1.5 text-[10px] text-slate-500 border-b border-white/5">
                Account session
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-brand-error hover:bg-brand-error/10 rounded-md transition-standard cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
