import { db } from './db';
import { services, serviceGallery, projects, projectServices, projectAssignments, projectMilestones, projectPhotos, users } from './db/schema';
import { sql } from 'drizzle-orm';

// We have 5 DUMMY_SERVICES hardcoded previously in app/api/services/route.ts
// Re-declaring them here since they aren't exported cleanly
const DUMMY_SERVICES = [
    {
        id: "1",
        name: "Living Room Design",
        slug: "living-room-design",
        category: "interior",
        description: "Complete living room transformation with custom furniture, lighting, and color schemes tailored to your style.",
        minPrice: 15000, maxPrice: 75000,
        minTimelineWeeks: 2, maxTimelineWeeks: 6,
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
        materials: ["Premium upholstery", "Solid wood", "Marble accents", "Custom lighting"],
        featured: true,
        gallery: [
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600",
        ]
    },
    {
        id: "2",
        name: "Kitchen Renovation",
        slug: "kitchen-renovation",
        category: "interior",
        description: "Modern or classic kitchen design with premium cabinetry, countertops, and appliances.",
        minPrice: 80000, maxPrice: 250000,
        minTimelineWeeks: 4, maxTimelineWeeks: 12,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        materials: ["Quartz countertops", "Hardwood cabinets", "Stainless steel", "Backsplash tiles"],
        featured: true,
        gallery: [
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
        ]
    },
    {
        id: "3",
        name: "Bedroom Makeover",
        slug: "bedroom-makeover",
        category: "interior",
        description: "Create a serene retreat with custom bedding, storage solutions, and ambient lighting.",
        minPrice: 12000, maxPrice: 50000,
        minTimelineWeeks: 1, maxTimelineWeeks: 4,
        image: "https://images.unsplash.com/photo-1616594039964-ae902f2eea57?w=800",
        materials: ["Luxury linens", "Custom wardrobes", "Soft lighting", "Carpet/wood flooring"],
        featured: false,
        gallery: [
            "https://images.unsplash.com/photo-1616594039964-ae902f2eea57?w=600",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
        ]
    },
    {
        id: "4",
        name: "Facade & Exterior Paint",
        slug: "facade-exterior-paint",
        category: "exterior",
        description: "Professional exterior painting and facade restoration for lasting curb appeal.",
        minPrice: 25000, maxPrice: 120000,
        minTimelineWeeks: 2, maxTimelineWeeks: 6,
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        materials: ["Weather-resistant paint", "Primer", "Sealant", "Decorative trim"],
        featured: true,
        gallery: [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",
        ]
    },
    {
        id: "5",
        name: "Landscape Design",
        slug: "landscape-design",
        category: "exterior",
        description: "Garden design, hardscaping, and outdoor living spaces that extend your home.",
        minPrice: 30000, maxPrice: 150000,
        minTimelineWeeks: 4, maxTimelineWeeks: 16,
        image: "https://images.unsplash.com/photo-1558904541-efa84396aec2?w=800",
        materials: ["Natural stone", "Plants & shrubs", "Outdoor lighting", "Paving"],
        featured: false,
        gallery: [
            "https://images.unsplash.com/photo-1558904541-efa84396aec2?w=600",
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
        ]
    }
];

const DUMMY_PROJECTS = [
    {
        id: "proj_1",
        title: "Mitchell Living Room Redesign",
        clientName: "Sarah Mitchell",
        clientEmail: "sarah.m@example.com",
        status: "completed",
        startDate: "2023-08-15",
        endDate: "2023-10-20",
        budget: 45000,
        createdAt: "2023-08-01",
        content: "A complete overhaul of a mid-century living space.",
        serviceIds: ["1"],
        assignedTo: ["EMP1"],
        milestones: [
            { id: "m1", title: "Design Approval", dueDate: "2023-08-30", completed: true, completedAt: "2023-08-28" },
            { id: "m2", title: "Furniture Delivery", dueDate: "2023-10-05", completed: true, completedAt: "2023-10-02" }
        ],
        progressPhotos: [
            { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600", caption: "Finished living room", uploadedAt: "2023-10-20" }
        ]
    }
];

async function seedData() {
    console.log("Starting DB Seed Process...");
    try {
        // Clear existing tables in exact dependent order
        await db.execute(sql`TRUNCATE TABLE "project_services", "project_assignments", "project_milestones", "project_photos", "projects", "service_gallery", "services" RESTART IDENTITY CASCADE`);

        const serviceIdMap = new Map();

        // 1. Insert Services
        for (const s of DUMMY_SERVICES) {
            const [insertedService] = await db.insert(services).values({
                name: s.name,
                slug: s.slug,
                category: s.category,
                description: s.description,
                minPrice: s.minPrice,
                maxPrice: s.maxPrice,
                minTimelineWeeks: s.minTimelineWeeks,
                maxTimelineWeeks: s.maxTimelineWeeks,
                image: s.image,
                materials: s.materials,
                featured: s.featured,
            }).returning({ id: services.id });

            serviceIdMap.set(s.id, insertedService.id);

            // 1b. Insert Service Galleries
            for (let i = 0; i < s.gallery.length; i++) {
                await db.insert(serviceGallery).values({
                    serviceId: insertedService.id,
                    url: s.gallery[i],
                    displayOrder: i,
                });
            }
        }
        console.log("✅ Inserted Services & Service Galleries");

        // We need existing users to assign projects to. Grab the first admin.
        const adminUsers = await db.select().from(users).limit(1);
        const adminId = adminUsers.length > 0 ? adminUsers[0].id : null;

        // 2. Insert Projects
        for (const p of DUMMY_PROJECTS) {
            const [insertedProject] = await db.insert(projects).values({
                title: p.title,
                clientName: p.clientName,
                clientEmail: p.clientEmail,
                status: p.status,
                startDate: new Date(p.startDate),
                endDate: p.endDate ? new Date(p.endDate) : null,
                budget: p.budget,
                content: p.content,
                createdAt: new Date(p.createdAt),
            }).returning({ id: projects.id });

            // 2b. Project Services Junction
            // Mapping the old hardcoded service IDs (1, 2, 3) to the True UUIDs assigned by Postgres
            for (const oldSvcId of p.serviceIds) {
                const realSvcId = serviceIdMap.get(oldSvcId);
                // Hardcode fallback just in case DUMMY_PROJECTS references missing services
                if (realSvcId) {
                    await db.insert(projectServices).values({
                        projectId: insertedProject.id,
                        serviceId: realSvcId,
                    });
                }
            }

            // 2c. Project Assignees (Map them to admin)
            if (adminId) {
                for (const oldEmpId of p.assignedTo) {
                    await db.insert(projectAssignments).values({
                        projectId: insertedProject.id,
                        userId: adminId, // Funnelling all fake 'EMP1' users to the single Admin record
                    });
                }
            }

            // 2d. Project Milestones
            for (const m of p.milestones) {
                await db.insert(projectMilestones).values({
                    projectId: insertedProject.id,
                    title: m.title,
                    dueDate: new Date(m.dueDate),
                    completed: m.completed,
                    completedAt: m.completedAt ? new Date(m.completedAt) : null,
                });
            }

            // 2e. Project Photos
            for (const img of p.progressPhotos) {
                await db.insert(projectPhotos).values({
                    projectId: insertedProject.id,
                    url: img.url,
                    caption: img.caption,
                    uploadedAt: img.uploadedAt ? new Date(img.uploadedAt) : new Date(),
                });
            }
        }
        console.log("✅ Inserted Projects, Milestones, Galleries & Junctions");

    } catch (err: any) {
        console.error("Seeding Failed:", err.message);
    }
    process.exit(0);
}

seedData();
