"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

type User = { id: string; name: string; email: string; role: string; avatar?: string };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(raw) as User);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)] animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

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

            <Link
              href="/login"
              onClick={() => {
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("role");
              }}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
