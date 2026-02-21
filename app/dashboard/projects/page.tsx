"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Project = {
  id: string;
  title: string;
  clientName: string;
  serviceName: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  assignedTo: string[];
  assignedEmployeeNames?: { id: string; name: string }[];
  milestones: { id: string; title: string; completed: boolean }[];
};

const statusColors: Record<string, string> = {
  planning: "bg-[var(--button)]/20 text-[var(--button)]",
  active: "bg-[var(--accent)]/20 text-[var(--accent)]",
  on_hold: "bg-[var(--muted-bg)] text-[var(--muted)]",
  completed: "bg-[var(--accent)]/20 text-[var(--accent)]",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?expand=employees")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Projects
      </h1>
      <p className="mt-1 text-[var(--muted)]">Projects with assigned employees (many-to-many). Data from /api/projects?expand=employees</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const done = p.milestones.filter((m) => m.completed).length;
          const total = p.milestones.length;
          return (
            <Card key={p.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--foreground)]">{p.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.clientName}</p>
                  <p className="text-sm text-[var(--muted)]">{p.serviceName}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    statusColors[p.status] ?? "bg-[var(--muted-bg)] text-[var(--muted)]"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                ₹{p.budget.toLocaleString()} · {p.startDate}
                {p.endDate ? ` – ${p.endDate}` : ""}
              </p>
              {p.assignedEmployeeNames && p.assignedEmployeeNames.length > 0 && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Assigned: {p.assignedEmployeeNames.map((e) => e.name).join(", ")}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted-bg)]">
                  <div
                    className="h-full bg-[var(--accent)]/60 transition-all"
                    style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {done}/{total} milestones
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
