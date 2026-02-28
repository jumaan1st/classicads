import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectServices, projectAssignments, projectMilestones, projectPhotos, users, services } from "@/db/schema";
import { eq, inArray, desc, sql, and } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import { revalidatePath } from "next/cache";

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

    // List fetching & DB Pagination
    let allowedProjectIds: string[] | null = null;

    if (assignedTo || serviceId) {
      let assignmentIds: string[] = [];
      let serviceProjIds: string[] = [];

      if (assignedTo) {
        const pAssigns = await db.select({ projectId: projectAssignments.projectId }).from(projectAssignments).where(eq(projectAssignments.userId, assignedTo));
        assignmentIds = pAssigns.map(a => a.projectId);
      }
      if (serviceId) {
        const pServices = await db.select({ projectId: projectServices.projectId }).from(projectServices).where(eq(projectServices.serviceId, serviceId));
        serviceProjIds = pServices.map(s => s.projectId);
      }

      if (assignedTo && serviceId) {
        allowedProjectIds = assignmentIds.filter(id => serviceProjIds.includes(id));
      } else if (assignedTo) {
        allowedProjectIds = assignmentIds;
      } else {
        allowedProjectIds = serviceProjIds;
      }
    }

    const filterConditions = [eq(projects.isDeleted, false)];
    if (status) filterConditions.push(eq(projects.status, status));

    if (allowedProjectIds !== null) {
      if (allowedProjectIds.length === 0) {
        // Break early if filters yield no results
        return NextResponse.json({ projects: [], total: 0, page, limit, totalPages: 0 });
      } else {
        filterConditions.push(inArray(projects.id, allowedProjectIds));
      }
    }

    const finalCondition = and(...filterConditions);
    const offset = (page - 1) * limit;

    // Parallelize core data fetch and row count
    const [rawProjects, totalResult] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(finalCondition)
        .orderBy(desc(projects.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(finalCondition)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const projectIds = rawProjects.map(p => p.id);

    let allMilestones: any[] = [];
    let allPhotos: any[] = [];
    let allPServices: any[] = [];
    let allAssigns: any[] = [];

    // Eliminate N+1. Fetch all dependencies simultaneously using inArray
    if (projectIds.length > 0) {
      [allMilestones, allPhotos, allPServices, allAssigns] = await Promise.all([
        db.select().from(projectMilestones).where(inArray(projectMilestones.projectId, projectIds)),
        db.select().from(projectPhotos).where(inArray(projectPhotos.projectId, projectIds)),
        db.select().from(projectServices).where(inArray(projectServices.projectId, projectIds)),
        db.select().from(projectAssignments).where(inArray(projectAssignments.projectId, projectIds))
      ]);
    }

    const allAssignUserIds = [...new Set(allAssigns.map(a => a.userId))];
    let allUsers: any[] = [];
    if (expandEmployees && allAssignUserIds.length > 0) {
      allUsers = await db.select({ id: users.id, name: users.email }).from(users).where(inArray(users.id, allAssignUserIds));
    }

    const allFormatted = rawProjects.map(p => {
      const pM = allMilestones.filter(m => m.projectId === p.id);
      const pP = allPhotos.filter(photo => photo.projectId === p.id);
      const pS = allPServices.filter(s => s.projectId === p.id).map(s => s.serviceId);
      const pA = allAssigns.filter(a => a.projectId === p.id).map(a => a.userId);

      const formatted: any = {
        ...p,
        serviceIds: pS,
        assignedTo: pA,
        milestones: pM.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate ? m.dueDate.toISOString().split('T')[0] : null,
          completed: m.completed,
          completedAt: m.completedAt ? m.completedAt.toISOString() : null
        })),
        progressPhotos: pP.map(photo => ({
          url: photo.url,
          caption: photo.caption,
          uploadedAt: photo.uploadedAt ? photo.uploadedAt.toISOString() : null
        })),
        startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : null,
        endDate: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
      };

      if (expandEmployees && pA.length > 0) {
        formatted.assignedEmployeeNames = pA.map(userId => {
          const u = allUsers.find(u => u.id === userId);
          return {
            id: userId,
            name: u ? u.name.split('@')[0] : 'Unknown'
          };
        });
      }

      return formatted;
    });

    return NextResponse.json({
      projects: allFormatted,
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

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/about");

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

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/about");

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

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/about");

    return NextResponse.json({ success: true, message: "Project successfully deleted." });
  } catch (err: any) {
    console.error("Project DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
