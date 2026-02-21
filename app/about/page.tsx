"use client";

import { useEffect, useState } from "react";

type PageContent = { title: string; description: string };

export default function AboutPage() {
  const [content, setContent] = useState<PageContent | null>(null);

  useEffect(() => {
    fetch("/api/pages?slug=about")
      .then((r) => r.json())
      .then((d) => (d.slug ? setContent(d) : setContent(null)))
      .catch(() => setContent(null));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 flex flex-col items-center text-center md:items-start md:text-left sm:px-6 md:px-8 md:py-20">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
        {content?.title ?? "About ClassicAds"}
      </h1>
      <div className="mt-8 max-w-none text-[var(--muted)]">
        <p className="whitespace-pre-wrap text-lg leading-relaxed">
          {content?.description ??
            "ClassicAds has been delivering high-quality interior and exterior design solutions for years. Our team of designers and project managers works closely with you to turn your vision into reality."}
        </p>
      </div>
    </div>
  );
}
