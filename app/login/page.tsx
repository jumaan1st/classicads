"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/me?role=admin`);
      const user = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("role", "admin");
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
          Admin Sign In
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Access the dashboard to manage your projects and services.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--button)] py-2.5 font-semibold text-[var(--button-text)] hover:bg-[var(--button-hover)] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Continue to Dashboard"}
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
