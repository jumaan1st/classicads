"use client";

import { useState, useEffect } from "react";

type Service = { id: string; name: string; slug: string };

type WhatsAppContactProps = {
  phone?: string | null;
};

export default function WhatsAppContact({ phone }: WhatsAppContactProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => setServices([]));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) return;

    // Clean phone number
    const cleaned = phone.replace(/\D/g, "");
    const number = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

    const parts: string[] = [];

    if (service) {
      const selectedService =
        services.find((s) => s.slug === service)?.name ?? service;
      parts.push(`Service: ${selectedService}`);
    }

    if (area.trim()) parts.push(`Area: ${area.trim()}`);
    if (message.trim()) parts.push(`Query: ${message.trim()}`);

    const text =
      parts.length > 0 ? parts.join("\n") : "Hi, I’d like to enquire.";

    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener");
  };

  // If phone not loaded yet, don't render form
  if (!phone) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="wa-service"
          className="block text-sm font-medium text-[var(--muted)]"
        >
          Service (optional)
        </label>
        <select
          id="wa-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-[15px] text-[var(--foreground)] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="wa-area"
          className="block text-sm font-medium text-[var(--muted)]"
        >
          Area / Location (optional)
        </label>
        <input
          id="wa-area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="e.g. Downtown, Phase 2"
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-[15px] text-[var(--foreground)] placeholder-[var(--muted)] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
        />
      </div>

      <div>
        <label
          htmlFor="wa-message"
          className="block text-sm font-medium text-[var(--muted)]"
        >
          Your message *
        </label>
        <textarea
          id="wa-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Brief description of what you need..."
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-[15px] text-[var(--foreground)] placeholder-[var(--muted)] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-y"
        />
      </div>

      <button
        type="submit"
        className="flex mt-6 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] px-4 py-4 font-semibold text-white transition-all shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
        </svg>
        Open in WhatsApp
      </button>
    </form>
  );
}