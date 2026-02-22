"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
};

export default function DashboardCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const load = () => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", phone: "", address: "", notes: "" });
      setFormOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Customers
          </h1>
          <p className="text-[var(--muted)] text-sm">
            Store and manage customer details. Admin only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="rounded-lg bg-[var(--button)] px-4 py-2.5 text-[15px] font-semibold text-[var(--button-text)] hover:bg-[var(--button-hover)]"
        >
          {formOpen ? "Cancel" : "Add customer"}
        </button>
      </div>

      {formOpen && (
        <Card className="p-6 sm:p-8 bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] shadow-md">
          <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">
            New Customer
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 px-4 py-3 text-[var(--foreground)] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 px-4 py-3 text-[var(--foreground)] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 px-4 py-3 text-[var(--foreground)] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 px-4 py-3 text-[var(--foreground)] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="123 Main St"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/50 px-4 py-3 text-[var(--foreground)] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none"
                placeholder="Any additional details..."
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--foreground)] px-6 py-3 text-sm font-bold text-[var(--background)] hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
              >
                {saving ? "Saving…" : "Save Customer"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]/50 text-[var(--muted)] text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 sm:px-6">Name</th>
                <th className="p-4 sm:px-6">Email</th>
                <th className="p-4 sm:px-6">Phone</th>
                <th className="p-4 sm:px-6">Address</th>
                <th className="p-4 sm:px-6 hidden md:table-cell">Notes</th>
                <th className="p-4 sm:px-6">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-blue-500/5 transition-colors group"
                >
                  <td className="p-4 sm:px-6 font-medium text-[var(--foreground)] group-hover:text-blue-400 transition-colors">{c.name}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)]">{c.email}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)]">{c.phone || "—"}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)]">{c.address || "—"}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)] max-w-xs truncate hidden md:table-cell">{c.notes || "—"}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)] text-xs font-medium tracking-wider uppercase">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && !formOpen && (
          <p className="p-8 text-center text-[var(--muted)]">No customers yet. Add one above.</p>
        )}
      </Card>
    </div>
  );
}
