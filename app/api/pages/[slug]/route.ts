import { NextResponse } from "next/server";

// Re-use the in-memory store from parent route (same process)
// In a real app this would be a shared DB. For dummy data we need to duplicate or import.
// Next.js doesn't allow importing from ../route.ts easily, so we'll use a shared module.
import { getPages, getPageBySlug, updatePageBySlug } from "../store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  const page = getPageBySlug(slug);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  const body = await request.json();
  const page = updatePageBySlug(slug, body);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}
