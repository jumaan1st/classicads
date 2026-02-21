"use client";

import { useState, useEffect } from "react";

type Service = { id: string; name: string; slug: string };

export default function WhatsAppContact() {
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<{ whatsappUrl: string; whatsappNumber: string } | null>(null);
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []));
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    const parts: string[] = [];
    if (service) {
      const name = services.find((s) => s.id === service || s.slug === service)?.name ?? service;
      parts.push(`Service: ${name}`);
    }
    if (area.trim()) parts.push(`Area: ${area.trim()}`);
    if (message.trim()) parts.push(`Query: ${message.trim()}`);
    const text = parts.length ? parts.join("\n") : "Hi, I’d like to enquire.";
    const url = `${config.whatsappUrl}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  };

  if (!config) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wa-service" className="block text-sm font-medium text-[var(--muted)]">
          Service (optional)
        </label>
        <select
          id="wa-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
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
        <label htmlFor="wa-area" className="block text-sm font-medium text-[var(--muted)]">
          Area / Location (optional)
        </label>
        <input
          id="wa-area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="e.g. Downtown, Phase 2"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label htmlFor="wa-message" className="block text-sm font-medium text-[var(--muted)]">
          Your message *
        </label>
        <textarea
          id="wa-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Brief description of what you need..."
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Open in WhatsApp
      </button>
    </form>
  );
}
