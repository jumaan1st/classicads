import { NextResponse } from "next/server";

export type UserRole = "customer" | "employee" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Dummy users for role-based UI. Replace with real auth (JWT/session) when integrating DB.
const DUMMY_USERS: Record<string, AuthUser> = {
  customer: {
    id: "C1",
    name: "Guest Customer",
    email: "guest@email.com",
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  },
  employee: {
    id: "EMP1",
    name: "Alex Rivera",
    email: "alex.r@classicads.com",
    role: "employee",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
  admin: {
    id: "ADM1",
    name: "Admin User",
    email: "admin@classicads.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get("role") || "customer") as UserRole;
  const user = DUMMY_USERS[role] || DUMMY_USERS.customer;
  return NextResponse.json(user);
}
