import { NextResponse } from "next/server";

export type UserRole = "customer" | "employee" | "admin";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  joinedAt: string;
  projectsCompleted: number;
  activeProjects: number;
  phone?: string;
}

const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: "EMP1",
    name: "Alex Rivera",
    email: "alex.r@classicads.com",
    role: "employee",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    department: "Interior Design",
    joinedAt: "2023-06-01",
    projectsCompleted: 24,
    activeProjects: 2,
    phone: "+1 555-1001",
  },
  {
    id: "EMP2",
    name: "Sofia Patel",
    email: "sofia.p@classicads.com",
    role: "employee",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    department: "Exterior & Kitchen",
    joinedAt: "2023-09-15",
    projectsCompleted: 18,
    activeProjects: 1,
    phone: "+1 555-1002",
  },
  {
    id: "EMP3",
    name: "David Kim",
    email: "david.k@classicads.com",
    role: "employee",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    department: "Project Management",
    joinedAt: "2024-01-10",
    projectsCompleted: 8,
    activeProjects: 1,
    phone: "+1 555-1003",
  },
  {
    id: "ADM1",
    name: "Admin User",
    email: "admin@classicads.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    department: "Management",
    joinedAt: "2022-01-01",
    projectsCompleted: 0,
    activeProjects: 0,
    phone: "+1 555-0000",
  },
];

// Many-to-many: projects have assignedTo[] (employee IDs). Employees appear in multiple projects.
const DUMMY_PROJECTS_ASSIGNMENTS: { projectId: string; projectTitle: string; employeeIds: string[] }[] = [
  { projectId: "P1", projectTitle: "Mitchell Living Room", employeeIds: ["EMP1"] },
  { projectId: "P2", projectTitle: "Chen Kitchen Renovation", employeeIds: ["EMP2", "EMP3"] },
  { projectId: "P3", projectTitle: "Villa Exterior Paint", employeeIds: ["EMP2"] },
];

function getEmployeeProjectIds(employeeId: string): { projectId: string; projectTitle: string }[] {
  return DUMMY_PROJECTS_ASSIGNMENTS.filter((p) => p.employeeIds.includes(employeeId)).map(
    ({ projectId, projectTitle }) => ({ projectId, projectTitle })
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const role = searchParams.get("role");
  const department = searchParams.get("department");
  const withProjects = searchParams.get("withProjects") === "true";

  if (id) {
    const employee = DUMMY_EMPLOYEES.find((e) => e.id === id);
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const res = { ...employee, projects: withProjects ? getEmployeeProjectIds(employee.id) : undefined };
    return NextResponse.json(res);
  }

  let data = DUMMY_EMPLOYEES.filter((e) => e.role !== "customer");
  if (role) data = data.filter((e) => e.role === role);
  if (department) data = data.filter((e) => e.department.toLowerCase().includes(department.toLowerCase()));

  if (withProjects) {
    data = data.map((e) => ({ ...e, projects: getEmployeeProjectIds(e.id) }));
  }
  return NextResponse.json({ employees: data });
}
