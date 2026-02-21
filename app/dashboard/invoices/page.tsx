"use client";

import { useEffect, useState } from "react";
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
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Invoices
      </h1>
      <p className="mt-1 text-[var(--muted)]">Data from /api/invoices</p>
      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Due</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[var(--muted-bg)]/30">
                  <td className="p-4 font-medium text-[var(--foreground)]">{inv.invoiceNumber}</td>
                  <td className="p-4 text-[var(--muted)]">{inv.projectTitle}</td>
                  <td className="p-4 text-[var(--muted)]">{inv.clientName}</td>
                  <td className="p-4 text-[var(--muted)]">{inv.dueDate}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[inv.status] ?? "bg-[var(--muted-bg)] text-[var(--muted)]"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-[var(--accent)]">
                    {inv.currency} {inv.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
