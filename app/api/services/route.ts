import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceGallery } from "@/db/schema";
import { eq, desc, sql, and, inArray, ilike } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug");

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "6", 10);

    // If fetching Single Service by Slug
    if (slug) {
      const rawServices = await db.select().from(services).where(eq(services.slug, slug));
      if (!rawServices.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const s = rawServices[0];

      const galleryRows = await db.select().from(serviceGallery).where(eq(serviceGallery.serviceId, s.id));

      return NextResponse.json({
        ...s,
        priceRange: { min: s.minPrice, max: s.maxPrice },
        timelineWeeks: { min: s.minTimelineWeeks, max: s.maxTimelineWeeks },
        gallery: galleryRows.map(g => g.url)
      });
    }

    // List fetching & DB Pagination
    const filterConditions = [eq(services.isDeleted, false)];
    if (category) filterConditions.push(ilike(services.category, category));
    if (featured === "true") filterConditions.push(eq(services.featured, true));

    const finalCondition = and(...filterConditions);
    const offset = (page - 1) * limit;

    // Parallel DB queries for data and count
    const [rawServices, totalResult] = await Promise.all([
      db
        .select()
        .from(services)
        .where(finalCondition)
        .orderBy(desc(services.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(services)
        .where(finalCondition)
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // Eliminate N+1 Query: Fetch all gallery images for these services simultaneously
    const serviceIds = rawServices.map(s => s.id);
    let allGalleryRows: any[] = [];
    if (serviceIds.length > 0) {
      allGalleryRows = await db
        .select()
        .from(serviceGallery)
        .where(inArray(serviceGallery.serviceId, serviceIds));
    }

    const paginatedData = rawServices.map(s => {
      const galleryUrls = allGalleryRows
        .filter(g => g.serviceId === s.id)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(g => g.url);

      return {
        ...s,
        priceRange: { min: s.minPrice, max: s.maxPrice },
        timelineWeeks: { min: s.minTimelineWeeks, max: s.maxTimelineWeeks },
        gallery: galleryUrls
      };
    });

    return NextResponse.json({
      services: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err: any) {
    console.error("Services fetch error:", err.message);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const newService = await db.insert(services).values({
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: data.description,
      minPrice: data.priceRange?.min || data.minPrice,
      maxPrice: data.priceRange?.max || data.maxPrice,
      minTimelineWeeks: data.timelineWeeks?.min || data.minTimelineWeeks,
      maxTimelineWeeks: data.timelineWeeks?.max || data.maxTimelineWeeks,
      image: data.image,
      materials: data.materials || [],
      featured: data.featured || false,
    }).returning();

    if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
      await db.insert(serviceGallery).values(
        data.gallery.map((url: string, index: number) => ({
          serviceId: newService[0].id,
          url,
          displayOrder: index
        }))
      );
    }

    revalidatePath("/dashboard/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return NextResponse.json(newService[0], { status: 201 });
  } catch (err: any) {
    console.error("Service POST error:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });

    const updatedService = await db.update(services).set({
      name: updateData.name,
      slug: updateData.slug,
      category: updateData.category,
      description: updateData.description,
      minPrice: updateData.priceRange?.min || updateData.minPrice,
      maxPrice: updateData.priceRange?.max || updateData.maxPrice,
      minTimelineWeeks: updateData.timelineWeeks?.min || updateData.minTimelineWeeks,
      maxTimelineWeeks: updateData.timelineWeeks?.max || updateData.maxTimelineWeeks,
      image: updateData.image,
      materials: updateData.materials,
      featured: updateData.featured,
      updatedAt: new Date()
    }).where(eq(services.id, id)).returning();

    if (updateData.gallery && Array.isArray(updateData.gallery)) {
      await db.delete(serviceGallery).where(eq(serviceGallery.serviceId, id));
      if (updateData.gallery.length > 0) {
        await db.insert(serviceGallery).values(
          updateData.gallery.map((url: string, index: number) => ({
            serviceId: id,
            url,
            displayOrder: index
          }))
        );
      }
    }

    revalidatePath("/dashboard/services");
    revalidatePath("/services");
    revalidatePath(`/services/${updateData.slug}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return NextResponse.json(updatedService[0]);
  } catch (err: any) {
    console.error("Service PUT error:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });

    const existingService = await db.select({ slug: services.slug }).from(services).where(eq(services.id, id));
    if (!existingService.length) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const timestamp = Math.floor(Date.now() / 1000);
    const newSlug = `${existingService[0].slug}-deleted-${timestamp}`;

    await db.update(services).set({
      isDeleted: true,
      deletedAt: new Date(),
      slug: newSlug
    }).where(eq(services.id, id));

    revalidatePath("/dashboard/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return NextResponse.json({ success: true, message: "Service successfully deleted." });
  } catch (err: any) {
    console.error("Service DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
