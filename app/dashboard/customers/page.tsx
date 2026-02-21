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
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Customers
          </h1>
          <p className="mt-1 text-[var(--muted)]">
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
        <Card className="mt-8 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--foreground)]">
            New customer
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--muted)]">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--muted)]">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--button)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] hover:bg-[var(--button-hover)] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save customer"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">Address</th>
                <th className="p-4 font-medium">Notes</th>
                <th className="p-4 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted-bg)]/30"
                >
                  <td className="p-4 font-medium text-[var(--foreground)]">{c.name}</td>
                  <td className="p-4 text-[var(--muted)]">{c.email}</td>
                  <td className="p-4 text-[var(--muted)]">{c.phone || "—"}</td>
                  <td className="p-4 text-[var(--muted)]">{c.address || "—"}</td>
                  <td className="p-4 text-[var(--muted)] max-w-xs truncate">{c.notes || "—"}</td>
                  <td className="p-4 text-[var(--muted)]">
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
