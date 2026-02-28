import ProjectsClient from "@/components/ProjectsClient";
import { db } from "@/db";
import { projects, projectMilestones, projectPhotos, projectServices, projectAssignments, users, services } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
type Service = { id: string; name: string };
type Project = {
  id: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  content?: string;
  serviceIds: string[];
  progressPhotos?: { url: string }[];
};

export default async function ProjectsPage() {
  // Fetch initial projects directly from DB
  const rawProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.isDeleted, false))
    .orderBy(desc(projects.createdAt))
    .limit(100);

  const projectIds = rawProjects.map(p => p.id);
  let allMilestones: any[] = [];
  let allPhotos: any[] = [];
  let allPServices: any[] = [];
  let allAssigns: any[] = [];

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
  if (allAssignUserIds.length > 0) {
    allUsers = await db.select({ id: users.id, name: users.email }).from(users).where(inArray(users.id, allAssignUserIds));
  }

  const initialProjects: Project[] = rawProjects.map(p => {
    const pM = allMilestones.filter(m => m.projectId === p.id);
    const pP = allPhotos.filter(photo => photo.projectId === p.id);
    const pS = allPServices.filter(s => s.projectId === p.id).map(s => s.serviceId);
    const pA = allAssigns.filter(a => a.projectId === p.id).map(a => a.userId);

    const formatted: any = {
      ...p,
      serviceIds: pS,
      assignedTo: pA,
      startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : null,
      endDate: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
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
      }))
    };

    if (pA.length > 0) {
      formatted.assignedEmployeeNames = pA.map(userId => {
        const u = allUsers.find(u => u.id === userId);
        return {
          id: userId,
          name: u ? u.name.split('@')[0] : 'Unknown'
        };
      });
    }

    return formatted as Project;
  });

  // Fetch Services
  const servicesListRaw = await db.select().from(services).where(eq(services.isDeleted, false));
  const initialServicesMap: Record<string, string> = {};
  servicesListRaw.forEach((s) => {
    initialServicesMap[s.id] = s.name;
  });

  return (
    <ProjectsClient
      initialProjects={initialProjects}
      initialServicesMap={initialServicesMap}
    />
  );
}
