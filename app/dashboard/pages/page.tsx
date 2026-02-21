"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type PageContent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  metaDescription?: string;
  updatedAt: string;
};

export default function DashboardPagesPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [editing, setEditing] = useState<PageContent | null>(null);
  const [form, setForm] = useState({ title: "", description: "", metaDescription: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((d) => setPages(d.pages ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const startEdit = (p: PageContent) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, metaDescription: p.metaDescription ?? "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await fetch(`/api/pages/${editing.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Page content (CRUD)
      </h1>
      <p className="mt-1 text-[var(--muted)]">Edit blog-like descriptions for Home, Services, About, Contact.</p>

      {editing ? (
        <Card className="mt-8 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Edit: {editing.slug}</h2>
          <form onSubmit={save} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Description (blog-style)</label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)]">Meta description (optional)</label>
              <input
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {pages.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--foreground)]">{p.slug}</p>
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{p.description}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Updated: {p.updatedAt.slice(0, 10)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="shrink-0 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/20"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
