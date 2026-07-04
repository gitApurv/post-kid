import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  ArrowRight,
  Activity,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import useAuthStore from "../store/AuthStore";

export default function LoginPage() {
  const loginAction = useAuthStore((state) => state.loginAction);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    const res = await loginAction({ username, password });
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-brand-bg font-sans overflow-y-auto">
      {/* Left Column: Hero & Visual Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-brand-layer-1 via-brand-bg to-brand-layer-2 border-r border-white/5 relative overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Brand logo header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-white tracking-tight leading-none">
              PostKid
            </h1>
            <span className="text-[9px] font-semibold tracking-wider text-brand-primary uppercase">
              API Platform
            </span>
          </div>
        </div>

        {/* Hero copy and visual mockup */}
        <div className="my-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-extrabold text-white leading-tight">
              Manage collections, <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 bg-clip-text text-transparent">
                execute requests.
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Organize API requests into collections and folders, toggle
              environment variables, and collaborate across workspaces.
            </p>
          </div>

          {/* Premium mockup window */}
          <div className="rounded-xl border border-white/10 bg-brand-layer-1/50 backdrop-blur-md overflow-hidden shadow-2xl relative max-w-md">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 select-none">
                workspace-details.json
              </span>
            </div>

            <div className="p-5 font-mono text-[11px] space-y-4">
              <div className="flex items-center gap-2 bg-brand-layer-2/50 border border-white/5 p-2 rounded-lg">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-success/20 text-brand-success">
                  GET
                </span>
                <span className="text-slate-300 truncate">
                  https://api.postkid.com/api/v1/workspaces
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">
                  Active Workspace Settings
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400 bg-white/[0.02] px-2.5 py-1 rounded border border-white/5">
                    <span className="text-brand-primary font-medium">
                      workspace_role
                    </span>
                    <span>"ADMIN"</span>
                  </div>
                  <div className="flex justify-between text-slate-400 bg-white/[0.02] px-2.5 py-1 rounded border border-white/5">
                    <span className="text-brand-primary font-medium">
                      variables_count
                    </span>
                    <span className="text-brand-warning">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Metrics */}
        <div className="flex gap-6 relative z-10 text-[11px] text-slate-400 border-t border-white/5 pt-6">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-success" />
            <span>Workspace Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>Role-Based Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-secondary" />
            <span>REST Client Engine</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form (Full size on mobile, 7 cols on large screens) */}
      <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Glow behind card on mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-[440px] relative z-10">
          {/* Mobile Logo (visible on mobile only) */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary via-brand-secondary to-pink-500 flex items-center justify-center shadow-lg mb-3">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white">
              PostKid
            </h1>
            <span className="mt-1 px-2 py-0.5 text-[9px] font-semibold text-brand-primary border border-brand-primary/20 bg-brand-primary/5 rounded-full uppercase">
              API Platform
            </span>
          </div>

          {/* Form Card Container */}
          <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl border-white/10 relative overflow-hidden">
            {/* Top card accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-80" />

            <h2 className="text-xl font-display font-semibold text-white mb-1.5">
              Welcome back
            </h2>
            <p className="text-xs text-slate-400 mb-8">
              Enter your credentials to access the API workspace.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-xs text-brand-error flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superdeveloper"
                  className="block w-full pl-10 pr-3 py-3 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[10px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1.5 rounded transition-standard pointer-events-none">
                  Username
                </label>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[10px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1.5 rounded transition-standard pointer-events-none">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-standard"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3 px-4 font-display font-medium text-white text-sm bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-standard overflow-hidden flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    Connect Workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-standard" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link (Moved inside card) */}
            <p className="mt-8 text-center text-xs text-slate-500">
              New to PostKid?{" "}
              <Link
                to="/register"
                className="text-brand-primary hover:text-brand-secondary transition-standard font-medium"
              >
                Create a Developer Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
