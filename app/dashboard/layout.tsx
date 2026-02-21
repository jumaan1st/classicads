"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

type User = { id: string; name: string; email: string; role: string; avatar?: string };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const role = (user.role || "employee") as "employee" | "admin";

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardSidebar role={role} />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-medium text-[var(--foreground)]">Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">{user.name}</span>
            <Link
              href="/login"
              onClick={() => {
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("role");
              }}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              Logout
            </Link>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
