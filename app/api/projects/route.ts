import { NextResponse } from "next/server";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
  assignedTo: string[];
  milestones: Milestone[];
  progressPhotos: { url: string; caption: string; uploadedAt: string }[];
  createdAt: string;
}

// Many-to-many: each project has assignedTo[] (employee IDs). Resolve to names for UI.
const EMPLOYEE_NAMES: Record<string, string> = {
  EMP1: "Alex Rivera",
  EMP2: "Sofia Patel",
  EMP3: "David Kim",
};

const DUMMY_PROJECTS: Project[] = [
  {
    id: "P1",
    title: "Mitchell Living Room",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah.m@email.com",
    serviceId: "1",
    serviceName: "Living Room Design",
    status: "active",
    startDate: "2025-02-01",
    endDate: "2025-03-15",
    budget: 65000,
    assignedTo: ["EMP1"],
    milestones: [
      { id: "M1", title: "Concept approval", dueDate: "2025-02-05", completed: true, completedAt: "2025-02-04" },
      { id: "M2", title: "Material ordering", dueDate: "2025-02-12", completed: true, completedAt: "2025-02-11" },
      { id: "M3", title: "Installation", dueDate: "2025-03-10", completed: false },
      { id: "M4", title: "Final handover", dueDate: "2025-03-15", completed: false },
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400", caption: "Initial state", uploadedAt: "2025-02-01T10:00:00Z" },
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", caption: "Furniture placed", uploadedAt: "2025-02-18T14:00:00Z" },
    ],
    createdAt: "2025-01-28T10:00:00Z",
  },
  {
    id: "P2",
    title: "Chen Kitchen Renovation",
    clientName: "James Chen",
    clientEmail: "james.chen@email.com",
    serviceId: "2",
    serviceName: "Kitchen Renovation",
    status: "planning",
    startDate: "2025-03-01",
    budget: 180000,
    assignedTo: ["EMP2", "EMP3"],
    milestones: [
      { id: "M5", title: "Final design sign-off", dueDate: "2025-02-25", completed: false },
      { id: "M6", title: "Demolition", dueDate: "2025-03-08", completed: false },
      { id: "M7", title: "Cabinetry install", dueDate: "2025-04-01", completed: false },
    ],
    progressPhotos: [],
    createdAt: "2025-02-17T14:00:00Z",
  },
  {
    id: "P3",
    title: "Villa Exterior Paint",
    clientName: "Raj Kapoor",
    clientEmail: "raj.k@email.com",
    serviceId: "4",
    serviceName: "Facade & Exterior Paint",
    status: "completed",
    startDate: "2025-01-10",
    endDate: "2025-02-10",
    budget: 95000,
    assignedTo: ["EMP2"],
    milestones: [
      { id: "M8", title: "Surface prep", dueDate: "2025-01-15", completed: true, completedAt: "2025-01-14" },
      { id: "M9", title: "Primer & paint", dueDate: "2025-02-05", completed: true, completedAt: "2025-02-05" },
      { id: "M10", title: "Handover", dueDate: "2025-02-10", completed: true, completedAt: "2025-02-10" },
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400", caption: "Completed facade", uploadedAt: "2025-02-10T12:00:00Z" },
    ],
    createdAt: "2025-01-05T09:00:00Z",
  },
];

export type ProjectWithEmployees = Project & {
  assignedEmployeeNames?: { id: string; name: string }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");
  const expandEmployees = searchParams.get("expand") === "employees";

  function withEmployeeNames(project: Project): ProjectWithEmployees {
    if (!expandEmployees) return project;
    return {
      ...project,
      assignedEmployeeNames: project.assignedTo.map((eid) => ({
        id: eid,
        name: EMPLOYEE_NAMES[eid] ?? eid,
      })),
    };
  }

  if (id) {
    const project = DUMMY_PROJECTS.find((p) => p.id === id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(withEmployeeNames(project));
  }

  let data = [...DUMMY_PROJECTS];
  if (status) data = data.filter((p) => p.status === status);
  if (assignedTo) data = data.filter((p) => p.assignedTo.includes(assignedTo));

  return NextResponse.json({ projects: data.map(withEmployeeNames) });
}
