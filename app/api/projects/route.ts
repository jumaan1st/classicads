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
  serviceIds: string[]; // Supports many-to-many relationship with services
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
  assignedTo: string[];
  milestones: Milestone[];
  progressPhotos: { url: string; caption: string; uploadedAt: string }[];
  content: string; // Rich text or markdown content for the detail page
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
    serviceIds: ["1", "6"], // Connected to Living Room Design & Consultation
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
      { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800", caption: "Initial state", uploadedAt: "2025-02-01T10:00:00Z" },
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", caption: "Furniture placed", uploadedAt: "2025-02-18T14:00:00Z" },
    ],
    content: "The Mitchell living room redesign focused on maximizing natural light while introducing a sophisticated, earthy color palette. The family wanted a space that felt both luxurious and incredibly comfortable for daily use. We started with custom wide-plank oak flooring, layered with a hand-tufted wool rug, and finalized the room with an oversized sectional. \n\nThe primary challenge was integrating their existing brick fireplace. We solved this by lime-washing the brick and creating custom, built-in floating shelves on either side, turning a dated element into a striking modern focal point.",
    createdAt: "2025-01-28T10:00:00Z",
  },
  {
    id: "P2",
    title: "Chen Kitchen Renovation",
    clientName: "James Chen",
    clientEmail: "james.chen@email.com",
    serviceIds: ["2"], // Kitchen Renovation
    status: "planning",
    startDate: "2025-03-01",
    budget: 180000,
    assignedTo: ["EMP2", "EMP3"],
    milestones: [
      { id: "M5", title: "Final design sign-off", dueDate: "2025-02-25", completed: true },
      { id: "M6", title: "Demolition", dueDate: "2025-03-08", completed: false },
      { id: "M7", title: "Cabinetry install", dueDate: "2025-04-01", completed: false },
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800", caption: "Before", uploadedAt: "2025-02-10T10:00:00Z" },
    ],
    content: "James Chen requested a complete overhaul of his closed-off, 90s-era kitchen. The objective was to create an open-concept chef's kitchen capable of hosting large extended-family gatherings. We are moving load-bearing walls to expand the footprint into the adjacent dining room.\\n\\nThe new layout features a massive 12-foot double-waterfall marble island, smart appliances hidden behind custom flat-panel walnut cabinetry, and a dedicated prep pantry to keep the main area pristine during events.",
    createdAt: "2025-02-17T14:00:00Z",
  },
  {
    id: "P3",
    title: "Villa Exterior Paint",
    clientName: "Raj Kapoor",
    clientEmail: "raj.k@email.com",
    serviceIds: ["4", "5"], // Facade & Exterior Paint, Landscape Design
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
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800", caption: "Completed facade", uploadedAt: "2025-02-10T12:00:00Z" },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", caption: "Side entrance", uploadedAt: "2025-02-10T12:05:00Z" },
    ],
    content: "The Kapoor Villa required a massive exterior rejuvenation. The original stucco was fading and chipping due to heavy sun exposure. We utilized a highly specialized, textured elastomeric coating that not only provides a stunning matte finish but also bridges hairline cracks and waterproofs the exterior.\\n\\nAdditionally, our landscaping team completely redesigned the front approach. We removed water-heavy lawns and replaced them with structured, drought-resistant xeriscaping featuring architectural agaves, corten steel planters, and subtle uplighting that makes the new facade glow at night.",
    createdAt: "2025-01-05T09:00:00Z",
  },
  {
    id: "P4",
    title: "Minimalist Master Suite",
    clientName: "Elena Rodriguez",
    clientEmail: "elena.r@email.com",
    serviceIds: ["3", "7"], // Bedroom Makeover, Bathroom Remodeling
    status: "completed",
    startDate: "2024-11-01",
    endDate: "2024-12-15",
    budget: 110000,
    assignedTo: ["EMP1", "EMP3"],
    milestones: [
      { id: "M11", title: "Demo", dueDate: "2024-11-05", completed: true, completedAt: "2024-11-04" },
      { id: "M12", title: "Plumbing rough-in", dueDate: "2024-11-15", completed: true, completedAt: "2024-11-14" },
      { id: "M13", title: "Finishes", dueDate: "2024-12-10", completed: true, completedAt: "2024-12-11" },
      { id: "M14", title: "Final Walkthrough", dueDate: "2024-12-15", completed: true, completedAt: "2024-12-15" }
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1616594039964-ae902f2eea57?w=800", caption: "Finished bedroom", uploadedAt: "2024-12-15T10:00:00Z" },
      { url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800", caption: "Ensuite bath", uploadedAt: "2024-12-15T11:00:00Z" }
    ],
    content: "Elena wanted to unify her master bedroom and ensuite bathroom into a singular, flowing sanctuary. The design relies heavily on 'Japandi' aesthetics—merging Japanese minimalism with Scandinavian warmth.\\n\\nWe tore down the dividing wall between the bedroom and bathroom, replacing it with smart-glass that turns opaque at the flick of a switch for privacy. The bathroom features a poured concrete soaking tub, while the bedroom utilizes custom slatted-wood wall paneling that hides all closet doors and storage.",
    createdAt: "2024-10-15T09:00:00Z",
  },
  {
    id: "P5",
    title: "Tech Startup Headquarters",
    clientName: "Nexus Data Systems",
    clientEmail: "facilities@nexusdata.tech",
    serviceIds: ["8"], // Commercial Office Design
    status: "active",
    startDate: "2025-01-20",
    budget: 450000,
    assignedTo: ["EMP1", "EMP2", "EMP3"],
    milestones: [
      { id: "M15", title: "Space Planning", dueDate: "2025-02-10", completed: true, completedAt: "2025-02-09" },
      { id: "M16", title: "Acoustic treatment", dueDate: "2025-03-01", completed: false },
      { id: "M17", title: "Furniture installation", dueDate: "2025-04-15", completed: false },
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", caption: "Open plan area", uploadedAt: "2025-02-10T15:00:00Z" },
    ],
    content: "Nexus Data Systems outgrew their incubator space and secured a 10,000 sq ft industrial loft. The goal is to retain the raw, industrial edge (exposed brick, ducts) while introducing high-tech, sound-dampened workspaces for deep engineering work.\\n\\nWe designed modular 'focus pods' built with custom acoustic felt and glass, alongside expansive, collaborative lounge zones. The entire lighting system is circadian-rhythm enabled, adjusting color temperature throughout the day to boost team energy and well-being.",
    createdAt: "2024-12-20T11:00:00Z",
  }
];

export type ProjectWithEmployees = Project & {
  assignedEmployeeNames?: { id: string; name: string }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");
  const serviceId = searchParams.get("serviceId");
  const expandEmployees = searchParams.get("expand") === "employees";

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "6", 10);

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
  if (serviceId) data = data.filter((p) => p.serviceIds.includes(serviceId));

  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return NextResponse.json({
    projects: paginatedData.map(withEmployeeNames),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}
