"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "@/components/Card";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  joinedAt: string;
  projectsCompleted: number;
  activeProjects: number;
  projects?: { projectId: string; projectTitle: string }[];
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees?withProjects=true")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Employees
      </h1>
      <p className="mt-1 text-[var(--muted)]">Employees with their projects (many-to-many). Data from /api/employees?withProjects=true</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((e) => (
          <Card key={e.id} className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[var(--muted-bg)]">
                <Image src={e.avatar} alt="" fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--foreground)]">{e.name}</h2>
                <p className="text-sm text-[var(--muted)]">{e.department}</p>
                <p className="text-xs text-[var(--muted)]">{e.role}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 border-t border-[var(--border)] pt-4 text-sm">
              <span className="text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">{e.projectsCompleted}</strong> completed
              </span>
              <span className="text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">{e.activeProjects}</strong> active
              </span>
            </div>
            {e.projects && e.projects.length > 0 && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Projects: {e.projects.map((p) => p.projectTitle).join(", ")}
              </p>
            )}
            <p className="mt-2 text-xs text-[var(--muted)]">Joined {e.joinedAt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
