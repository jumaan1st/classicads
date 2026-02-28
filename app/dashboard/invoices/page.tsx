"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import Card from "@/components/Card";

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

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
  items: InvoiceItem[];
};

const statusColors: Record<string, string> = {
  draft: "bg-[var(--muted-bg)] text-[var(--muted)] border border-[var(--border)]",
  sent: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  overdue: "bg-red-500/10 text-red-500 border border-red-500/20",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const load = (currentPage: number = 1) => {
    setLoading(true);
    fetch(`/api/invoices?page=${currentPage}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => {
        setInvoices(d.invoices ?? []);
        if (d.pagination) {
          setTotalPages(d.pagination.pages);
          setPage(d.pagination.current);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

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
        <button
          onClick={() => router.push("/dashboard/invoices/new")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all duration-300 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
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
              {invoices.map((inv) => {

                return (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                    className="hover:bg-blue-500/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 sm:px-6 font-medium text-[var(--foreground)] group-hover:text-blue-400 transition-colors">
                      <span className="text-[var(--muted)] text-xs mr-1">#</span>{inv.invoiceNumber}
                    </td>
                    <td className="p-4 sm:px-6 text-[var(--muted)]">{inv.projectTitle}</td>
                    <td className="p-4 sm:px-6 text-[var(--muted)]">{inv.clientName}</td>
                    <td className="p-4 sm:px-6 text-[var(--muted)] font-medium">
                      {new Date(inv.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 sm:px-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-widest uppercase ${statusColors[inv.status] ?? statusColors.draft}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 font-bold text-[var(--foreground)] tracking-tight">
                      <span className="text-[var(--muted)] font-medium text-xs mr-1">{inv.currency}</span>
                      {inv.total.toLocaleString()}
                    </td>
                    <td className="p-4 sm:px-6 text-right">
                      <button
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-[var(--muted-bg)] text-[var(--foreground)] hover:bg-blue-500/20 group-hover:bg-blue-500/20 group-hover:text-blue-500 hover:text-blue-500 transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--muted)]">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--card)]/50">
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
      </Card>
    </div>
  );
}
