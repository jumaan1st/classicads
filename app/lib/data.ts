import { DUMMY_PROJECTS } from "@/app/api/projects/route";

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function getPageContent(slug: string): Promise<{ title: string; description: string } | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/pages?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = await res.json();
    if (data.slug && data.title) return { title: data.title, description: data.description ?? "" };
    return null;
  } catch {
    return null;
  }
}

export async function getFeaturedServices(): Promise<
  { id: string; name: string; slug: string; description: string; image: string; priceRange: { min: number; max: number } }[]
> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/services?featured=true`, { cache: "no-store" });
    const json = await res.json();
    return json.services ?? [];
  } catch {
    return [];
  }
}

const DEFAULT_PROJECT_IMAGE = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800";

export async function getFeaturedProjects(): Promise<
  { id: string; title: string; clientName: string; serviceIds: string[]; status: string; image: string; content: string }[]
> {
  // Read directly from the in-process data — avoids unreliable HTTP self-fetches on Vercel
  // where VERCEL_URL points to the deployment URL, not the production alias.
  return DUMMY_PROJECTS.map((p) => ({
    id: p.id,
    title: p.title,
    clientName: p.clientName,
    serviceIds: p.serviceIds ?? [],
    status: p.status,
    content: p.content ?? "",
    image: p.progressPhotos?.[0]?.url ?? DEFAULT_PROJECT_IMAGE,
  }));
}
