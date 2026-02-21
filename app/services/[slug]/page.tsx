"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
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
  gallery: string[];
  materials: string[];
  featured: boolean;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/services?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setService(null) : setService(d)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }
  if (!service) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 text-center">
        <p className="text-[var(--muted)]">Service not found.</p>
        <Button href="/services" className="mt-4">
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <Link href="/services" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← All Services
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <span className="rounded bg-[var(--accent)]/10 px-2 py-1 text-xs text-[var(--accent)]">{service.category}</span>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-[var(--foreground)] md:text-4xl">
            {service.name}
          </h1>
          <p className="mt-4 text-[var(--muted)]">{service.description}</p>
          <p className="mt-4 text-lg font-medium text-[var(--accent)]">
            ₹{service.priceRange.min.toLocaleString()} – ₹{service.priceRange.max.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Timeline: {service.timelineWeeks.min}–{service.timelineWeeks.max} weeks
          </p>
          <Button href={`/quote?service=${service.slug}`} className="mt-6">
            Get a Quote
          </Button>
        </div>
      </div>

      {service.gallery?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Gallery
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {service.gallery.map((url, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        </section>
      )}

      {service.materials?.length > 0 && (
        <Card className="mt-12 p-6">
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Material options
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {service.materials.map((m) => (
              <li key={m} className="rounded-full bg-[var(--muted-bg)] px-3 py-1 text-sm text-[var(--muted)]">
                {m}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
