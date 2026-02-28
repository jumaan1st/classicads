import { db } from "@/db";
import { projects, projectPhotos, projectServices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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
  try {
    const rawProjects = await db.select().from(projects).orderBy(desc(projects.createdAt)).limit(6);
    const result = [];

    for (const p of rawProjects) {
      const photos = await db.select().from(projectPhotos).where(eq(projectPhotos.projectId, p.id));
      const pServices = await db.select({ serviceId: projectServices.serviceId }).from(projectServices).where(eq(projectServices.projectId, p.id));

      result.push({
        id: p.id,
        title: p.title,
        clientName: p.clientName,
        serviceIds: pServices.map(s => s.serviceId),
        status: p.status,
        content: p.content ?? "",
        image: photos.length > 0 ? photos[0].url : DEFAULT_PROJECT_IMAGE,
      });
    }
    return result;
  } catch (error) {
    console.error("Fetch featured projects failed:", error);
    return [];
  }
}
