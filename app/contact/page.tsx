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
    <div className="mx-auto max-w-2xl px-5 py-16 flex flex-col items-center text-center md:items-start md:text-left sm:px-6 md:px-8 md:py-20">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
        {content?.title ?? "Contact Us"}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
        {content?.description ??
          "Reach out via WhatsApp for the fastest response. Share your service interest, area, and query."}
      </p>

      <Card className="mt-10 p-6 md:p-8">
        <h2 className="mb-4 font-heading text-lg font-bold text-[var(--foreground)]">
          Send a message via WhatsApp
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[var(--muted)]">
          Choose a service and area if applicable, then type your message. You’ll be redirected to WhatsApp with
          everything pre-filled.
        </p>
        <WhatsAppContact />
      </Card>
    </div>
  );
}
