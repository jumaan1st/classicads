"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import Card from "@/components/Card";

type Invoice = {
  id: string;
  invoiceNumber: string;
  projectTitle: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: string;
  total: number;
  currency: string;
};

const statusColors: Record<string, string> = {
  draft: "bg-[var(--muted-bg)] text-[var(--muted)]",
  sent: "bg-[var(--button)]/20 text-[var(--button)]",
  paid: "bg-[var(--accent)]/20 text-[var(--accent)]",
  overdue: "bg-[var(--danger)]/20 text-[var(--danger)]",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Invoices
          </h1>
          <p className="text-[var(--muted)] text-sm">Track billing, overdue payments, and revenue collection.</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all duration-300 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      <Card className="overflow-hidden bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]/50 text-[var(--muted)] text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 sm:px-6">Invoice</th>
                <th className="p-4 sm:px-6">Project</th>
                <th className="p-4 sm:px-6">Client</th>
                <th className="p-4 sm:px-6">Due</th>
                <th className="p-4 sm:px-6">Status</th>
                <th className="p-4 sm:px-6">Total</th>
                <th className="p-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="p-4 sm:px-6 font-medium text-[var(--foreground)] group-hover:text-blue-400 transition-colors">
                    <span className="text-[var(--muted)] text-xs mr-1">#</span>{inv.invoiceNumber}
                  </td>
                  <td className="p-4 sm:px-6 text-[var(--muted)]">{inv.projectTitle}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)]">{inv.clientName}</td>
                  <td className="p-4 sm:px-6 text-[var(--muted)] font-medium">
                    {new Date(inv.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-widest uppercase border ${statusColors[inv.status]
                        ? statusColors[inv.status].replace("text-", "text-").replace("bg-", "bg-opacity-10 border-").concat(" border-opacity-20 bg-[var(--accent)]/10 text-[var(--foreground)]")
                        : "bg-[var(--muted-bg)] text-[var(--muted)] border-[var(--border)]"
                        }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 sm:px-6 font-bold text-[var(--foreground)] tracking-tight">
                    <span className="text-[var(--muted)] font-medium text-xs mr-1">{inv.currency}</span>
                    {inv.total.toLocaleString()}
                  </td>
                  <td className="p-4 sm:px-6 text-right">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-[var(--muted-bg)] text-[var(--foreground)] hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
