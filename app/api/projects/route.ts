import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectServices, projectAssignments, projectMilestones, projectPhotos, users, services } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const serviceId = searchParams.get("serviceId");
    const expandEmployees = searchParams.get("expand") === "employees";

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "6", 10);

    // If ID is requested
    if (id) {
      const rawProjects = await db.select().from(projects).where(eq(projects.id, id));
      if (!rawProjects.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const p = rawProjects[0];

      // Fetch Relations
      const milestones = await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, p.id));
      const photos = await db.select().from(projectPhotos).where(eq(projectPhotos.projectId, p.id));

      const pServices = await db.select({ serviceId: projectServices.serviceId }).from(projectServices).where(eq(projectServices.projectId, p.id));
      const serviceIds = pServices.map(s => s.serviceId);

      const pAssigns = await db.select({ userId: projectAssignments.userId }).from(projectAssignments).where(eq(projectAssignments.projectId, p.id));
      const assignedToIds = pAssigns.map(a => a.userId);

      const formatted = {
        ...p,
        serviceIds,
        assignedTo: assignedToIds,
        milestones: milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate ? m.dueDate.toISOString().split('T')[0] : null,
          completed: m.completed,
          completedAt: m.completedAt ? m.completedAt.toISOString() : null
        })),
        progressPhotos: photos.map(photo => ({
          url: photo.url,
          caption: photo.caption,
          uploadedAt: photo.uploadedAt ? photo.uploadedAt.toISOString() : null
        })),
        startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : null,
        endDate: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
      };

      if (expandEmployees && assignedToIds.length) {
        const userRecords = await db.select({ id: users.id, name: users.email }).from(users).where(inArray(users.id, assignedToIds));
        (formatted as any).assignedEmployeeNames = userRecords.map(u => ({
          id: u.id,
          name: u.name.split('@')[0]
        }));
      }

      return NextResponse.json(formatted);
    }

    // List fetching filtering natively in memory to easily mimic existing exact endpoint behavior rapidly
    // Realize production should use raw SQL joins/subqueries
    const rawProjects = await db.select().from(projects).where(eq(projects.isDeleted, false)).orderBy(desc(projects.createdAt));
    let allFormatted = [];

    for (const p of rawProjects) {
      const milestones = await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, p.id));
      const photos = await db.select().from(projectPhotos).where(eq(projectPhotos.projectId, p.id));

      const pServices = await db.select({ serviceId: projectServices.serviceId }).from(projectServices).where(eq(projectServices.projectId, p.id));
      const serviceIds = pServices.map(s => s.serviceId);

      const pAssigns = await db.select({ userId: projectAssignments.userId }).from(projectAssignments).where(eq(projectAssignments.projectId, p.id));
      const assignedToIds = pAssigns.map(a => a.userId);

      const formatted = {
        ...p,
        serviceIds,
        assignedTo: assignedToIds,
        milestones: milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate ? m.dueDate.toISOString().split('T')[0] : null,
          completed: m.completed,
          completedAt: m.completedAt ? m.completedAt.toISOString() : null
        })),
        progressPhotos: photos.map(photo => ({
          url: photo.url,
          caption: photo.caption,
          uploadedAt: photo.uploadedAt ? photo.uploadedAt.toISOString() : null
        })),
        startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : null,
        endDate: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
      };

      if (expandEmployees && assignedToIds.length) {
        const userRecords = await db.select({ id: users.id, name: users.email }).from(users).where(inArray(users.id, assignedToIds));
        (formatted as any).assignedEmployeeNames = userRecords.map(u => ({
          id: u.id,
          name: u.name.split('@')[0]
        }));
      }

      allFormatted.push(formatted);
    }

    // Apply exact legacy filters
    if (status) allFormatted = allFormatted.filter((p) => p.status === status);
    if (assignedTo) allFormatted = allFormatted.filter((p) => p.assignedTo.includes(assignedTo));
    if (serviceId) allFormatted = allFormatted.filter((p) => p.serviceIds.includes(serviceId));

    const total = allFormatted.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = allFormatted.slice(startIndex, endIndex);

    return NextResponse.json({
      projects: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error("Projects Fetch Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();

    const newProject = await db.insert(projects).values({
      title: data.title,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      budget: data.budget,
      content: data.content
    }).returning();

    const projectId = newProject[0].id;

    if (data.serviceIds && Array.isArray(data.serviceIds)) {
      if (data.serviceIds.length > 0) {
        await db.insert(projectServices).values(
          data.serviceIds.map((sid: string) => ({ projectId, serviceId: sid }))
        );
      }
    }

    if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
      await db.insert(projectPhotos).values(
        data.gallery.map((url: string) => ({ projectId, url }))
      );
    }

    if (data.assignedTo && Array.isArray(data.assignedTo)) {
      if (data.assignedTo.length > 0) {
        await db.insert(projectAssignments).values(
          data.assignedTo.map((uid: string) => ({ projectId, userId: uid }))
        );
      }
    }

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (err: any) {
    console.error("Project POST error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

    const updatedProject = await db.update(projects).set({
      title: updateData.title,
      clientName: updateData.clientName,
      clientEmail: updateData.clientEmail,
      status: updateData.status,
      startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
      endDate: updateData.endDate ? new Date(updateData.endDate) : null,
      budget: updateData.budget,
      content: updateData.content,
      updatedAt: new Date()
    }).where(eq(projects.id, id)).returning();

    if (updateData.serviceIds && Array.isArray(updateData.serviceIds)) {
      await db.delete(projectServices).where(eq(projectServices.projectId, id));
      if (updateData.serviceIds.length > 0) {
        await db.insert(projectServices).values(
          updateData.serviceIds.map((sid: string) => ({ projectId: id, serviceId: sid }))
        );
      }
    }

    if (updateData.gallery !== undefined && Array.isArray(updateData.gallery)) {
      await db.delete(projectPhotos).where(eq(projectPhotos.projectId, id));
      if (updateData.gallery.length > 0) {
        await db.insert(projectPhotos).values(
          updateData.gallery.map((url: string) => ({ projectId: id, url }))
        );
      }
    }

    if (updateData.assignedTo && Array.isArray(updateData.assignedTo)) {
      await db.delete(projectAssignments).where(eq(projectAssignments.projectId, id));
      if (updateData.assignedTo.length > 0) {
        await db.insert(projectAssignments).values(
          updateData.assignedTo.map((uid: string) => ({ projectId: id, userId: uid }))
        );
      }
    }

    return NextResponse.json(updatedProject[0]);
  } catch (err: any) {
    console.error("Project PUT error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

    const existingProject = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id));
    if (!existingProject.length) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await db.update(projects).set({
      isDeleted: true,
      deletedAt: new Date(),
    }).where(eq(projects.id, id));

    return NextResponse.json({ success: true, message: "Project successfully deleted." });
  } catch (err: any) {
    console.error("Project DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
