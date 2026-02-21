import { NextResponse } from "next/server";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  serviceInterest: string;
  budgetRange: string;
  message?: string;
  createdAt: string;
  followUpAt?: string;
  assignedTo?: string;
}

const DUMMY_LEADS: Lead[] = [
  {
    id: "L1",
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "+1 555-0101",
    source: "Website",
    status: "qualified",
    serviceInterest: "Living Room Design",
    budgetRange: "₹50,000 - ₹1,00,000",
    message: "Looking for a complete living room makeover.",
    createdAt: "2025-02-18T10:00:00Z",
    followUpAt: "2025-02-22T10:00:00Z",
    assignedTo: "EMP1",
  },
  {
    id: "L2",
    name: "James Chen",
    email: "james.chen@email.com",
    phone: "+1 555-0102",
    source: "Referral",
    status: "proposal",
    serviceInterest: "Kitchen Renovation",
    budgetRange: "₹2,00,000+",
    createdAt: "2025-02-17T14:30:00Z",
    followUpAt: "2025-02-21T09:00:00Z",
    assignedTo: "EMP2",
  },
  {
    id: "L3",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    phone: "+1 555-0103",
    source: "WhatsApp",
    status: "new",
    serviceInterest: "Bedroom Makeover",
    budgetRange: "₹25,000 - ₹50,000",
    message: "Need bedroom design for master bedroom.",
    createdAt: "2025-02-20T09:15:00Z",
    assignedTo: "EMP1",
  },
  {
    id: "L4",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 555-0104",
    source: "Website",
    status: "contacted",
    serviceInterest: "Facade & Exterior Paint",
    budgetRange: "₹75,000 - ₹1,50,000",
    createdAt: "2025-02-19T11:00:00Z",
    followUpAt: "2025-02-23T14:00:00Z",
    assignedTo: "EMP2",
  },
  {
    id: "L5",
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1 555-0105",
    source: "Instagram",
    status: "won",
    serviceInterest: "Design Consultation",
    budgetRange: "₹5,000 - ₹10,000",
    createdAt: "2025-02-10T08:00:00Z",
    assignedTo: "EMP1",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");

  let data = [...DUMMY_LEADS];
  if (status) data = data.filter((l) => l.status === status);
  if (assignedTo) data = data.filter((l) => l.assignedTo === assignedTo);

  return NextResponse.json({ leads: data });
}
