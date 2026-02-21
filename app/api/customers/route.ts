import { NextResponse } from "next/server";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

let CUSTOMERS: Customer[] = [
  {
    id: "C1",
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "+1 555-0101",
    address: "123 Park Avenue",
    notes: "Living room project completed.",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "C2",
    name: "James Chen",
    email: "james.chen@email.com",
    phone: "+1 555-0102",
    address: "45 Oak Street",
    notes: "Kitchen renovation in progress.",
    createdAt: "2025-02-01T14:00:00Z",
  },
  {
    id: "C3",
    name: "Raj Kapoor",
    email: "raj.k@email.com",
    phone: "+1 555-0103",
    address: "78 Villa Road",
    notes: "Exterior paint completed.",
    createdAt: "2025-01-05T09:00:00Z",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const customer = CUSTOMERS.find((c) => c.id === id);
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(customer);
  }

  return NextResponse.json({ customers: CUSTOMERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, notes } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    const newCustomer: Customer = {
      id: `C${Date.now()}`,
      name: String(name),
      email: String(email),
      phone: String(phone ?? ""),
      address: address ? String(address) : undefined,
      notes: notes ? String(notes) : undefined,
      createdAt: new Date().toISOString(),
    };
    CUSTOMERS.push(newCustomer);
    return NextResponse.json(newCustomer);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, address, notes } = body;
    const customer = CUSTOMERS.find((c) => c.id === id);
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name !== undefined) customer.name = String(name);
    if (email !== undefined) customer.email = String(email);
    if (phone !== undefined) customer.phone = String(phone);
    if (address !== undefined) customer.address = address ? String(address) : undefined;
    if (notes !== undefined) customer.notes = notes ? String(notes) : undefined;
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  CUSTOMERS = CUSTOMERS.filter((c) => c.id !== id);
  return NextResponse.json({ ok: true });
}
