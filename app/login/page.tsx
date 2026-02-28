"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Phone, Loader2, ShieldCheck, MonitorSmartphone, X, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  // Device Limit Modal State
  const [deviceLimitReached, setDeviceLimitReached] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSessionToRevoke, setSelectedSessionToRevoke] = useState<any | null>(null);
  const [revokePassword, setRevokePassword] = useState("");
  const [revokingLoading, setRevokingLoading] = useState(false);

  useEffect(() => {
    // Check if the database is empty and needs the first admin setup
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/auth/setup");
        const data = await res.json();
        if (data.needsSetup) setNeedsSetup(true);
      } catch (err) {
        console.error("Failed to check setup status");
      } finally {
        setCheckingSetup(false);
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login";

      const payload = needsSetup
        ? { email: formData.emailOrPhone, password: formData.password }
        : { email: formData.emailOrPhone, password: formData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 403 && data.activeSessions) {
        setActiveSessions(data.activeSessions);
        setDeviceLimitReached(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      // Success! Redirect to the protected dashboard showing devices if first login
      const targetUrl = callbackUrl.includes('?')
        ? `${callbackUrl}&showDevices=true`
        : `${callbackUrl}?showDevices=true`;

      router.push(targetUrl);
      router.refresh();

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRevokeAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevokingLoading(true);
    setError("");

    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login";
      const payload = {
        email: formData.emailOrPhone,
        password: revokePassword,
        revokeSessionId: selectedSessionToRevoke.id
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      const targetUrl = callbackUrl.includes('?')
        ? `${callbackUrl}&showDevices=true`
        : `${callbackUrl}?showDevices=true`;

      router.push(targetUrl);
      router.refresh();

    } catch (err: any) {
      setError(err.message);
      setRevokingLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-[var(--foreground)] mb-2">
            {needsSetup ? "Initialize System" : "Welcome Back"}
          </h1>
          <p className="text-[var(--muted)] text-sm">
            {needsSetup
              ? "No users found in the database. Set up the Master Admin account to secure the system."
              : "Enter your credentials to access the admin dashboard."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] ml-1">
              {needsSetup ? "Admin Email" : "Email or Phone"}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                {needsSetup ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <input
                type={needsSetup ? "email" : "text"}
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={needsSetup ? "admin@classicads.com" : "Email address or phone number"}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Password
              </label>
              {!needsSetup && (
                <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={needsSetup ? 8 : 1}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.emailOrPhone || !formData.password}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {loading ? "Authenticating..." : needsSetup ? "Create Master Admin" : "Log In"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Device Limit Reached Modal */}
      {deviceLimitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 relative">
              <button
                onClick={() => {
                  setDeviceLimitReached(false);
                  setSelectedSessionToRevoke(null);
                  setRevokePassword("");
                  setError("");
                }}
                className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] rounded-full transition-colors"
                disabled={revokingLoading}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>

              {!selectedSessionToRevoke ? (
                <>
                  <h2 className="text-xl font-bold font-heading text-[var(--foreground)] mb-1">Device Limit Exceeded</h2>
                  <p className="text-sm text-[var(--muted)] mb-6">
                    You are currently logged in on the maximum number of devices. Please select a device to log out of to continue.
                  </p>

                  <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {activeSessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSessionToRevoke(s);
                          setError("");
                        }}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border bg-[var(--background)] border-[var(--border)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors group"
                      >
                        <MonitorSmartphone className="w-5 h-5 text-[var(--muted)] group-hover:text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {s.deviceInfo || "Unknown Device"}
                          </p>
                          <p className="text-xs text-[var(--muted)] truncate">
                            {s.ipAddress} • {formatDistanceToNow(new Date(s.lastActiveAt))} ago
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedSessionToRevoke(null);
                      setRevokePassword("");
                      setError("");
                    }}
                    className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4 transition-colors"
                    disabled={revokingLoading}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to devices
                  </button>

                  <h2 className="text-xl font-bold font-heading text-[var(--foreground)] mb-1">Confirm Identity</h2>
                  <p className="text-sm text-[var(--muted)] mb-6">
                    To log out of <strong className="text-[var(--foreground)] font-semibold">{selectedSessionToRevoke.deviceInfo}</strong> and log in here, please enter your password again.
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRevokeAndLogin} className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={revokePassword}
                        onChange={(e) => setRevokePassword(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={revokingLoading || !revokePassword}
                      className="w-full flex items-center justify-center py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-red-500/20"
                    >
                      {revokingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Revoke & Log In"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
