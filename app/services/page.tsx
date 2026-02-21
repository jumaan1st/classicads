"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/Card";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceRange: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  image: string;
  featured: boolean;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [pageContent, setPageContent] = useState<{ title: string; description: string } | null>(null);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages?slug=services")
      .then((r) => r.json())
      .then((d) => (d.slug ? setPageContent({ title: d.title, description: d.description }) : setPageContent(null)))
      .catch(() => setPageContent(null));
  }, []);

  useEffect(() => {
    const q = category ? `?category=${category}` : "";
    fetch(`/api/services${q}`)
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[var(--border)] pt-16 md:pt-20 pb-4 md:pb-6">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 flex flex-col items-center text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {pageContent?.title ?? "Our Services"}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-4 pb-12 sm:px-6 md:px-8 md:pb-16">

        <div className="mt-0 flex flex-wrap justify-center md:justify-start gap-2">
          {["", "interior", "exterior", "consultation"].map((cat) => (
            <button
              key={cat || "all"}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${category === cat
                ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                }`}
            >
              {cat || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="group block">
                <Card className="overflow-hidden transition-smooth hover:border-[var(--accent)]/30">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/90 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-medium text-[var(--accent)]">
                      ₹{s.priceRange.min.toLocaleString()} – ₹{s.priceRange.max.toLocaleString()}
                    </span>
                    <span className="absolute top-3 right-3 rounded bg-[var(--card)] px-2 py-1 text-xs text-[var(--muted)]">
                      {s.timelineWeeks.min}–{s.timelineWeeks.max} weeks
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="font-heading text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                      {s.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{s.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
