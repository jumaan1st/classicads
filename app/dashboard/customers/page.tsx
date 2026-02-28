"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { Pencil, Trash2, X, User, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  notes?: string;
  createdAt: string;
};

export default function DashboardCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
    notes: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const load = (currentPage: number = 1) => {
    setLoading(true);
    fetch(`/api/customers?page=${currentPage}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers ?? []);
        if (d.pagination) {
          setTotalPages(d.pagination.pages);
          setPage(d.pagination.current);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", gstNumber: "", address: "", notes: "" });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gstNumber: customer.gstNumber || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setEditingId(customer.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/customers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Customers
          </h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">
            Store and manage customer details. Admin only.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto rounded-lg bg-[var(--button)] px-4 py-2.5 text-sm font-semibold text-[var(--button-text)] hover:bg-[var(--button-hover)] transition-colors"
        >
          + Add customer
        </button>
      </div>

      {customers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-[var(--card)]/90 border border-[var(--border)]">
          <User size={40} className="text-[var(--muted)] mb-3 opacity-40" />
          <p className="text-[var(--foreground)] font-semibold">No customers yet</p>
          <p className="text-[var(--muted)] text-sm mt-1">Add your first customer to get started.</p>
        </Card>
      ) : (
        <>
          {/* Desktop / Tablet Table — hidden on mobile */}
          <Card className="hidden sm:block overflow-hidden bg-[var(--card)]/90 border border-[var(--border)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]/50 text-xs uppercase font-semibold tracking-wide text-[var(--muted)]">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 hidden lg:table-cell">Phone</th>
                    <th className="p-4 hidden lg:table-cell">GSTIN</th>
                    <th className="p-4 hidden xl:table-cell">Address</th>
                    <th className="p-4 hidden xl:table-cell">Notes</th>
                    <th className="p-4 hidden md:table-cell">Added</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-500/5 transition-colors">
                      <td className="p-4 font-medium text-[var(--foreground)]">{c.name}</td>
                      <td className="p-4 text-[var(--muted)]">{c.email}</td>
                      <td className="p-4 hidden lg:table-cell text-[var(--muted)]">{c.phone || "—"}</td>
                      <td className="p-4 hidden lg:table-cell text-[var(--muted)] font-mono text-xs">{c.gstNumber || "—"}</td>
                      <td className="p-4 hidden xl:table-cell text-[var(--muted)] max-w-[160px] truncate">{c.address || "—"}</td>
                      <td className="p-4 hidden xl:table-cell text-[var(--muted)] max-w-[160px] truncate">{c.notes || "—"}</td>
                      <td className="p-4 hidden md:table-cell text-xs text-[var(--muted)]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openEditModal(c)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            aria-label="Edit customer"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            aria-label="Delete customer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards — visible only on mobile */}
          <div className="flex flex-col gap-3 sm:hidden">
            {customers.map((c) => (
              <Card
                key={c.id}
                className="bg-[var(--card)]/90 border border-[var(--border)] shadow-sm p-4 space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{c.name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(c)}
                      className="text-blue-500 hover:text-blue-600 p-1 transition-colors"
                      aria-label="Edit customer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-600 p-1 transition-colors"
                      aria-label="Delete customer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-[var(--border)] pt-3">
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-[var(--muted)]">
                      <Phone size={12} className="flex-shrink-0" />
                      <span className="truncate">{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-1.5 text-[var(--muted)]">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {c.gstNumber && (
                    <div className="flex items-center gap-1.5 text-blue-500/80 font-mono text-[10px]">
                      <FileText size={12} className="flex-shrink-0" />
                      <span className="truncate">{c.gstNumber}</span>
                    </div>
                  )}
                  {c.notes && (
                    <div className="col-span-2 flex items-start gap-1.5 text-[var(--muted)]">
                      <FileText size={12} className="flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-xs">{c.notes}</span>
                    </div>
                  )}
                  <div className="col-span-2 flex items-center gap-1.5 text-[var(--muted)] text-xs">
                    <Calendar size={11} className="flex-shrink-0" />
                    <span>Added {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-[var(--muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => load(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] bg-[var(--card)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted-bg)] transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] bg-[var(--card)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted-bg)] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[var(--card)] p-6 sm:p-8 shadow-xl max-h-[90dvh] overflow-y-auto">
            {/* Drag handle for mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-5" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                {editingId ? "Update Customer" : "New Customer"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                />
              </div>

              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                />
              </div>

              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                />
              </div>

              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                />
              </div>

              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  placeholder="GST Number (Optional)"
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-mono"
                />
              </div>

              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-3.5 text-[var(--muted)] pointer-events-none" />
                <textarea
                  rows={3}
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] pl-9 pr-4 py-3 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[var(--foreground)] px-6 py-3 text-sm font-bold text-[var(--background)] disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Saving…" : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}