"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  serviceInterest: string;
  budgetRange: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  new: "bg-[var(--accent)]/20 text-[var(--accent)]",
  contacted: "bg-[var(--button)]/20 text-[var(--button)]",
  qualified: "bg-[var(--accent)]/20 text-[var(--accent)]",
  proposal: "bg-[var(--button)]/20 text-[var(--button)]",
  won: "bg-[var(--accent)]/20 text-[var(--accent)]",
  lost: "bg-[var(--muted-bg)] text-[var(--muted)]",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
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
        CRM / Leads
      </h1>
      <p className="mt-1 text-[var(--muted)]">Data from /api/leads</p>
      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Budget</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-[var(--border)] hover:bg-[var(--muted-bg)]/30">
                  <td className="p-4 font-medium text-[var(--foreground)]">{l.name}</td>
                  <td className="p-4 text-[var(--muted)]">
                    {l.email}
                    <br />
                    <span className="text-xs">{l.phone}</span>
                  </td>
                  <td className="p-4 text-[var(--muted)]">{l.source}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[l.status] ?? "bg-[var(--muted-bg)] text-[var(--muted)]"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--muted)]">{l.serviceInterest}</td>
                  <td className="p-4 text-[var(--muted)]">{l.budgetRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
