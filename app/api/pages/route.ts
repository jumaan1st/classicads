import { NextResponse } from "next/server";
import {
  getPages,
  getPageBySlug,
  getPagesRef,
  setPages,
  type PageContent,
} from "./store";

export type { PageContent } from "./store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const page = getPageBySlug(slug);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(page);
  }
  return NextResponse.json({ pages: getPages() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, description, metaDescription } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: "slug and title required" }, { status: 400 });
    }
    const pages = getPagesRef();
    const existing = pages.find((p) => p.slug === slug);
    const now = new Date().toISOString();
    if (existing) {
      existing.title = title ?? existing.title;
      existing.description = description ?? existing.description;
      existing.metaDescription = metaDescription ?? existing.metaDescription;
      existing.updatedAt = now;
      return NextResponse.json(existing);
    }
    const newPage: PageContent = {
      id: String(pages.length + 1),
      slug,
      title,
      description: description ?? "",
      metaDescription: metaDescription ?? "",
      updatedAt: now,
    };
    setPages([...pages, newPage]);
    return NextResponse.json(newPage);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, slug, title, description, metaDescription } = body;
    const pages = getPagesRef();
    const page = id ? pages.find((p) => p.id === id) : slug ? pages.find((p) => p.slug === slug) : null;
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (title !== undefined) page.title = title;
    if (description !== undefined) page.description = description;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    page.updatedAt = new Date().toISOString();
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");
  const pages = getPagesRef();
  const page = id ? pages.find((p) => p.id === id) : slug ? pages.find((p) => p.slug === slug) : null;
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  setPages(pages.filter((p) => p.id !== page.id));
  return NextResponse.json({ ok: true });
}
