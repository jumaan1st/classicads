"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import WhatsAppContact from "@/components/WhatsAppContact";

type PageContent = { title: string; description: string };

export default function ContactPage() {
  const [content, setContent] = useState<PageContent | null>(null);

  useEffect(() => {
    fetch("/api/pages?slug=contact")
      .then((r) => r.json())
      .then((d) => (d.slug ? setContent(d) : setContent(null)))
      .catch(() => setContent(null));
  }, []);

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      <section className="relative overflow-hidden border-b border-[var(--border)] pt-16 md:pt-20 pb-4 md:pb-6">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-2xl px-5 flex flex-col items-center text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {content?.title ?? "Contact Us"}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl w-full px-5 pt-4 pb-12 md:pb-20 flex-grow">

        <Card className="mt-0 p-6 md:p-8">
          <h2 className="mb-4 font-heading text-lg font-bold text-[var(--foreground)]">
            Send a message via WhatsApp
          </h2>
          <p className="mb-6 text-[15px] leading-relaxed text-[var(--muted)]">
            Choose a service and area if applicable, then type your message. You’ll be redirected to WhatsApp with
            everything pre-filled.
          </p>
          <WhatsAppContact />
        </Card>

        <p className="mt-8 text-sm md:text-base text-center leading-relaxed text-[var(--muted)] px-4">
          {content?.description ??
            "Reach out via WhatsApp for the fastest response. Share your service interest, area, and query to get started with ClassicAds."}
        </p>
      </div>
    </div>
  );
}
