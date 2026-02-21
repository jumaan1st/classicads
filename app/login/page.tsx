"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";

type Role = "employee" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("employee");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock: persist role and fetch mock user from API
    try {
      const res = await fetch(`/api/auth/me?role=${role}`);
      const user = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("role", role);
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Staff only. Choose your role to access the dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)]">Login as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--button)] py-2.5 font-semibold text-[var(--button-text)] hover:bg-[var(--button-hover)] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </p>
      </Card>
    </div>
  );
}
