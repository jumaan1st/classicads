"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";

type Suggestion = {
  serviceName: string;
  estimatedMin: number;
  estimatedMax: number;
  timelineWeeks: string;
  materialSuggestions: string[];
  breakdown: { item: string; range: string }[];
};

export default function QuotePage() {
  const [roomSize, setRoomSize] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestion(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSize: roomSize ? Number(roomSize) : undefined,
          budget: budget ? Number(budget) : undefined,
        }),
      });
      const data = await res.json();
      if (data.suggestion) setSuggestion(data.suggestion);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 flex flex-col items-center text-center md:items-start md:text-left sm:px-6 md:px-8 md:py-20">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
        Get a Quote
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
        Share a few details and we’ll suggest an estimated cost and timeline. Data is from our API (dummy for now).
      </p>

      <Card className="mt-8 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="roomSize" className="block text-sm font-medium text-[var(--muted)]">
              Room size (sq ft, optional)
            </label>
            <input
              id="roomSize"
              type="number"
              min="0"
              value={roomSize}
              onChange={(e) => setRoomSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="e.g. 250"
            />
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-[var(--muted)]">
              Budget (₹, optional)
            </label>
            <input
              id="budget"
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="e.g. 50000"
            />
          </div>
          <Button type="submit" variant="primary">
            {loading ? "Getting suggestion…" : "Get AI suggestion"}
          </Button>
        </form>
      </Card>

      {suggestion && (
        <Card className="mt-8 p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Suggested estimate: {suggestion.serviceName}
          </h2>
          <p className="mt-2 text-[var(--accent)]">
            ₹{suggestion.estimatedMin.toLocaleString()} – ₹{suggestion.estimatedMax.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">Timeline: {suggestion.timelineWeeks}</p>
          {suggestion.materialSuggestions?.length > 0 && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Materials: {suggestion.materialSuggestions.join(", ")}
            </p>
          )}
          {suggestion.breakdown?.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
              {suggestion.breakdown.map((b, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">{b.item}</span>
                  <span className="text-[var(--foreground)]">{b.range}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
