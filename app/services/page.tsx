import ServicesClient from "@/components/ServicesClient";
import { db } from "@/db";
import { services, serviceGallery } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getPageBySlug, type PageContent } from "@/app/api/pages/store";
type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceRange: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  image: string;
  featured: boolean;
};

export default async function ServicesPage() {
  // 1. Fetch Page Content
  const content = getPageBySlug("services") as PageContent | null;
  const initialContent = content?.slug
    ? { title: content.title, description: content.description }
    : null;

  // 2. Fetch Services from DB directly
  const rawServices = await db
    .select()
    .from(services)
    .where(eq(services.isDeleted, false))
    .orderBy(desc(services.createdAt))
    .limit(100);

  const serviceIds = rawServices.map(s => s.id);
  let allGalleryRows: any[] = [];
  if (serviceIds.length > 0) {
    allGalleryRows = await db
      .select()
      .from(serviceGallery)
      .where(inArray(serviceGallery.serviceId, serviceIds));
  }

  const initialServices: Service[] = rawServices.map(s => {
    const galleryUrls = allGalleryRows
      .filter(g => g.serviceId === s.id)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(g => g.url);

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category || "",
      description: s.description || "",
      priceRange: { min: s.minPrice || 0, max: s.maxPrice || 0 },
      timelineWeeks: { min: s.minTimelineWeeks || 0, max: s.maxTimelineWeeks || 0 },
      image: s.image || "",
      featured: s.featured || false,
      gallery: galleryUrls
    } as Service;
  });

  return (
    <ServicesClient
      initialServices={initialServices}
      initialContent={initialContent}
    />
  );
}
