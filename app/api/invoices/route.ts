import { NextResponse } from "next/server";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  serviceIds: string[];
  pdfUrl?: string;
}

const DUMMY_INVOICES: Invoice[] = [
  {
    id: "INV1",
    invoiceNumber: "INV-2025-001",
    projectId: "P1",
    projectTitle: "Mitchell Living Room",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah.m@email.com",
    issueDate: "2025-02-01",
    dueDate: "2025-02-28",
    status: "sent",
    subtotal: 61415,
    gstPercent: 18,
    gstAmount: 11055,
    total: 72470,
    currency: "INR",
    serviceIds: ["1", "6"],
    items: [
      { description: "Living Room Design", quantity: 1, unitPrice: 45000, amount: 45000 },
      { description: "Design Consultation", quantity: 1, unitPrice: 8000, amount: 8000 },
      { description: "Accessories & Logistics", quantity: 1, unitPrice: 8415, amount: 8415 },
    ],
  },
  {
    id: "INV2",
    invoiceNumber: "INV-2025-002",
    projectId: "P3",
    projectTitle: "Villa Exterior Paint",
    clientName: "Raj Kapoor",
    clientEmail: "raj.k@email.com",
    issueDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "paid",
    subtotal: 80508,
    gstPercent: 18,
    gstAmount: 14492,
    total: 95000,
    currency: "INR",
    serviceIds: ["4", "5"],
    items: [
      { description: "Facade & Exterior Paint", quantity: 1, unitPrice: 55508, amount: 55508 },
      { description: "Landscape Design", quantity: 1, unitPrice: 25000, amount: 25000 },
    ],
  },
  {
    id: "INV3",
    invoiceNumber: "INV-2025-003",
    projectId: "P2",
    projectTitle: "Chen Kitchen Renovation",
    clientName: "James Chen",
    clientEmail: "james.chen@email.com",
    issueDate: "2025-02-20",
    dueDate: "2025-03-22",
    status: "draft",
    subtotal: 152542,
    gstPercent: 18,
    gstAmount: 27458,
    total: 180000,
    currency: "INR",
    serviceIds: ["2", "6", "7"],
    items: [
      { description: "Kitchen Renovation", quantity: 1, unitPrice: 97542, amount: 97542 },
      { description: "Bathroom Remodeling", quantity: 1, unitPrice: 30000, amount: 30000 },
      { description: "Design Consultation", quantity: 1, unitPrice: 25000, amount: 25000 },
    ],
  },
  {
    id: "INV4",
    invoiceNumber: "INV-2025-004",
    projectId: "P4",
    projectTitle: "Corporate HQ Fitout",
    clientName: "Priya Sharma",
    clientEmail: "priya.s@globalcorp.in",
    issueDate: "2025-03-01",
    dueDate: "2025-03-31",
    status: "overdue",
    subtotal: 296610,
    gstPercent: 18,
    gstAmount: 53390,
    total: 350000,
    currency: "INR",
    serviceIds: ["8", "6"],
    items: [
      { description: "Commercial Office Design", quantity: 1, unitPrice: 275000, amount: 275000 },
      { description: "Design Consultation", quantity: 1, unitPrice: 21610, amount: 21610 },
    ],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");

  if (id) {
    const invoice = DUMMY_INVOICES.find((i) => i.id === id);
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(invoice);
  }

  let data = [...DUMMY_INVOICES];
  if (status) data = data.filter((i) => i.status === status);
  if (projectId) data = data.filter((i) => i.projectId === projectId);

  return NextResponse.json({ invoices: data });
}
