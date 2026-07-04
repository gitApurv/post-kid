import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Terminal,
  ArrowRight,
  Check,
  Activity,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import useAuthStore from "../store/AuthStore";

export default function RegisterPage() {
  const registerAction = useAuthStore((state) => state.registerAction);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const checks = {
    length: hasLength,
    upperLower: hasUpperLower,
    number: hasNumber,
    special: hasSpecial,
  };

  let strength = 0;
  if (hasLength) strength += 25;
  if (hasUpperLower) strength += 25;
  if (hasNumber) strength += 25;
  if (hasSpecial) strength += 25;

  const getStrengthColor = () => {
    if (strength <= 25) return "bg-brand-error";
    if (strength <= 75) return "bg-brand-warning";
    return "bg-brand-success";
  };

  const isFormValid =
    username.length >= 5 &&
    email.includes("@") &&
    strength >= 50 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    const res = await registerAction({ username, email, password });
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Registration failed.");
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
              Setup workspaces, <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 bg-clip-text text-transparent">
                collaborate instantly.
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Create developer workspaces to organize collections, configure
              environments, and manage members with granular roles.
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
                workspace-bootstrap.sh
              </span>
            </div>

            <div className="p-5 font-mono text-[11px] space-y-3">
              <div className="text-slate-500 border-b border-white/5 pb-2">
                Initializing PostKid Workspace Bootstrap...
              </div>
              <div className="flex gap-2 text-slate-300">
                <span className="text-brand-success">✓</span>
                <span>Generating workspace database schemas</span>
              </div>
              <div className="flex gap-2 text-slate-300">
                <span className="text-brand-success">✓</span>
                <span>Preparing environment variable scopes</span>
              </div>
              <div className="flex gap-2 text-slate-300">
                <span className="text-brand-secondary animate-pulse-slow">
                  ●
                </span>
                <span className="text-slate-400">
                  Awaiting developer registration...
                </span>
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

          {/* Register Card Container */}
          <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl border-white/10 relative overflow-hidden">
            {/* Top card accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-80" />

            <h2 className="text-xl font-display font-semibold text-white mb-1.5">
              Create account
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Join global engineering teams managing REST variables.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                  Username
                </label>
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@postkid.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                  Email Address
                </label>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                  Password
                </label>
              </div>

              {/* Password Strength Bar */}
              <div className="space-y-1.5 px-0.5">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Password Strength</span>
                  <span className="font-semibold text-slate-300">
                    {strength}%
                  </span>
                </div>
              </div>

              {/* Password strength checklist display */}
              <div className="grid grid-cols-2 gap-1 px-1.5 py-1.5 bg-brand-layer-2/30 rounded border border-white/5 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.length ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.length && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Min 8 characters
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.upperLower ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.upperLower && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Upper & Lower letters
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.number ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.number && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Contains numbers
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.special ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.special && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Special character
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                  Confirm Password
                </label>
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <span className="absolute right-3 top-2.5 text-[9px] text-brand-error font-medium">
                      Mismatch
                    </span>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="relative w-full py-3 px-4 font-display font-medium text-white text-sm bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-standard overflow-hidden flex items-center justify-center gap-2 group mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    Register & Provision
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-standard" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link (Moved inside card) */}
            <p className="mt-6 text-center text-xs text-slate-500">
              Already have a developer account?{" "}
              <Link
                to="/login"
                className="text-brand-primary hover:text-brand-secondary transition-standard font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
