"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  progressPhotos?: { url: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?expand=employees")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  const imageFor = (p: Project) =>
    p.progressPhotos?.[0]?.url ?? "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800";

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="mb-12 flex flex-col items-center text-center md:items-start md:text-left">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
          Our Projects
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Browse our completed and ongoing interior & exterior design work. No login required.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects`} className="group block">
              <Card className="overflow-hidden transition-smooth hover:border-[var(--muted)]/40">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={imageFor(p)}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--background) 25%, transparent 55%)",
                    }}
                  />
                  <span className="absolute bottom-4 left-4 text-sm font-semibold text-[var(--foreground)]">
                    {p.serviceName}
                  </span>
                  <span
                    className="absolute top-4 right-4 rounded-lg px-2 py-1 text-xs font-medium bg-[var(--card)]/90 text-[var(--muted)]"
                  >
                    {p.status}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-heading text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--muted)]">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-[15px] text-[var(--muted)]">
                    {p.clientName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    ₹{p.budget.toLocaleString()}
                    {p.endDate ? ` · Completed ${p.endDate}` : ` · Started ${p.startDate}`}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--foreground)]/20 bg-transparent px-5 py-2.5 text-[15px] font-semibold text-[var(--foreground)] transition-smooth hover:bg-[var(--muted-bg)]"
        >
          Start your project
        </Link>
      </div>
    </div>
  );
}
