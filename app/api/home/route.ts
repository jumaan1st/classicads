import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, projects, projectPhotos, businessProfile } from "@/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export async function GET() {
    try {
        // -----------------------------------------------------
        // FEATURED SERVICES
        // -----------------------------------------------------
        const rawServices = await db
            .select({
                id: services.id,
                name: services.name,
                slug: services.slug,
                description: services.description,
                image: services.image,
                minPrice: services.minPrice,
                maxPrice: services.maxPrice,
            })
            .from(services)
            .where(eq(services.isDeleted, false))
            .orderBy(desc(services.createdAt))
            .limit(3);

        const featuredServices = rawServices.map(service => ({
            id: service.id,
            name: service.name,
            slug: service.slug,
            description: service.description,
            image: service.image,
            priceRange: {
                min: service.minPrice,
                max: service.maxPrice,
            },
        }));

        // -----------------------------------------------------
        // FEATURED PROJECTS
        // -----------------------------------------------------
        const baseProjects = await db
            .select({
                id: projects.id,
                title: projects.title,
                clientName: projects.clientName,
            })
            .from(projects)
            .where(eq(projects.isDeleted, false))
            .orderBy(desc(projects.createdAt))
            .limit(4);

        const projectIds = baseProjects.map(project => project.id);

        const projectImages = projectIds.length
            ? await db
                  .select({
                      projectId: projectPhotos.projectId,
                      url: projectPhotos.url,
                  })
                  .from(projectPhotos)
                  .where(inArray(projectPhotos.projectId, projectIds))
            : [];

        const imageLookup = new Map<string, string>();

        for (const photo of projectImages) {
            if (!imageLookup.has(photo.projectId)) {
                imageLookup.set(photo.projectId, photo.url);
            }
        }

        const featuredProjects = baseProjects.map(project => ({
            ...project,
            image: imageLookup.get(project.id) ?? "/placeholder.jpg",
        }));

        // -----------------------------------------------------
        // TOTAL PROJECT COUNT
        // -----------------------------------------------------
        const totalProjectsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(eq(projects.isDeleted, false));

        const totalProjects = Number(totalProjectsResult[0]?.count ?? 0);

        // -----------------------------------------------------
        // BUSINESS PROFILE + MAP DATA
        // -----------------------------------------------------
        const profileResult = await db
            .select({
                startedBusinessAt: businessProfile.startedBusinessAt,
                shopName: businessProfile.shopName,
                mapEmbedUrl: businessProfile.mapEmbedUrl,
            })
            .from(businessProfile)
            .limit(1);

        const profile = profileResult[0];

        const currentYear = new Date().getFullYear();
        const yearsOfExperience =
            profile?.startedBusinessAt
                ? currentYear - new Date(profile.startedBusinessAt).getFullYear()
                : 0;

        const mapData = {
            shopName: profile?.shopName ?? "Classic Advertisers Headquarters",
            mapEmbedUrl: profile?.mapEmbedUrl ?? null,
        };

        // -----------------------------------------------------
        // PAGE CONTENT
        // -----------------------------------------------------
        const pageContent = {
            description:
                "From concept to completion, ClassicAds delivers unparalleled interior and exterior design solutions tailored directly to your vision.",
            totalProjects,
            yearsOfExperience,
        };

        return NextResponse.json({
            pageContent,
            services: featuredServices,
            projects: featuredProjects,
            mapData,
        });

    } catch (error) {
        console.error("Error fetching home data:", error);
        return NextResponse.json(
            { error: "Failed to fetch home data" },
            { status: 500 }
        );
    }
}