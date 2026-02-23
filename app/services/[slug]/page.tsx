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
    <>
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
            {service.priceRange?.min ? (
              <p className="mt-4 text-lg font-medium text-[var(--accent)]">
                ₹{service.priceRange.min.toLocaleString()} – ₹{service.priceRange.max.toLocaleString()}
              </p>
            ) : (
              <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-blue-500 hover:underline">
                Contact us for pricing →
              </Link>
            )}
            <p className="mt-1 text-sm text-[var(--muted)]">
              Timeline: {service.timelineWeeks.min}–{service.timelineWeeks.max} weeks
            </p>


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

      <RelatedProjects serviceId={service.id} serviceName={service.name} />
    </>
  );
}

function RelatedProjects({ serviceId, serviceName }: { serviceId: string, serviceName: string }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?serviceId=${serviceId}&limit=3`)
      .then(r => r.json())
      .then(d => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) return null;
  if (projects.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] mt-16 pt-16 bg-[var(--section)] px-4 py-16 md:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-heading text-3xl font-bold text-[var(--foreground)] mb-8 text-center md:text-left">
          Projects featuring {serviceName}
        </h2>
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="group relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] aspect-[4/3] sm:aspect-[4/5] md:aspect-[3/4] shadow-sm block">
              <Image
                src={p.progressPhotos?.[0]?.url ?? "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
                alt={p.title}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]" />
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white/80 font-medium text-[10px] w-max mb-3 uppercase tracking-widest bg-white/10 px-2 py-1 rounded border border-white/10">{p.status.replace("_", " ")}</span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{p.title}</h3>
                <p className="text-white/80 text-sm font-medium">{p.clientName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
