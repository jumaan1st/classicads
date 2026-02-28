"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Menu, LogOut, User as UserIcon, MonitorSmartphone, ShieldCheck, X } from "lucide-react";

type User = { id: string; name: string; email: string; role: string; avatar?: string };

export default function ClientLayout({
  children,
  user
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Device Modal State
  const searchParams = useSearchParams();
  const router = useRouter();
  const showModalParam = searchParams.get("showDevices") === "true";
  const [showDeviceModal, setShowDeviceModal] = useState(showModalParam);
  const [deviceSessions, setDeviceSessions] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  useEffect(() => {
    if (showModalParam) {
      const fetchDevices = async () => {
        try {
          const res = await fetch("/api/auth/sessions");
          if (res.ok) {
            const data = await res.json();
            setDeviceSessions(data.sessions || []);
          }
        } finally {
          setLoadingDevices(false);
        }
      };
      fetchDevices();
    }
  }, [showModalParam]);

  const closeDeviceModal = () => {
    setShowDeviceModal(false);
    // Remove query param cleanly without reloading
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const role = (user.role || "employee") as "employee" | "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile sidebar overlay is handled inside DashboardSidebar */}
      <DashboardSidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow effect for main content area */}
        <div className="absolute top-0 right-1/4 h-[300px] w-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-[var(--foreground)] hover:bg-[var(--muted-bg)] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="hidden sm:block text-lg font-heading font-semibold text-[var(--foreground)]">ClassicAds Dashboard</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--muted-bg)]/50">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UserIcon className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-[var(--foreground)] pr-1">{user.name}</span>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Welcome Back / Device Info Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 relative">
              <button onClick={closeDeviceModal} className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold font-heading text-[var(--foreground)] mb-1">Login Successful</h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                You are currently signed in on the following devices. Up to 3 devices are allowed.
              </p>

              {loadingDevices ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {deviceSessions.map((s) => (
                    <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.isCurrentDevice ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[var(--background)] border-[var(--border)]'}`}>
                      <MonitorSmartphone className={`w-5 h-5 ${s.isCurrentDevice ? 'text-blue-500' : 'text-[var(--muted)]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {s.deviceInfo || "Unknown Device"}
                          {s.isCurrentDevice && <span className="ml-2 text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">This Device</span>}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">{s.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={closeDeviceModal}
                className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white rounded-xl font-medium transition-colors"
              >
                Continue to Dashboard
              </button>
              <div className="text-center mt-4">
                <Link href="/dashboard/devices" onClick={closeDeviceModal} className="text-xs text-blue-500 hover:text-blue-400 font-medium">
                  Manage Devices in Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
