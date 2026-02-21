import { NextResponse } from "next/server";

export interface QuoteRequest {
  serviceId?: string;
  roomSize?: number; // sq ft
  budget?: number;
  materials?: string[];
}

export interface QuoteSuggestion {
  serviceName: string;
  estimatedMin: number;
  estimatedMax: number;
  timelineWeeks: string;
  materialSuggestions: string[];
  breakdown: { item: string; range: string }[];
}

const DUMMY_QUOTE_RESPONSE: { suggestion: QuoteSuggestion } = {
  suggestion: {
    serviceName: "Living Room Design",
    estimatedMin: 45000,
    estimatedMax: 85000,
    timelineWeeks: "3–6 weeks",
    materialSuggestions: ["Premium upholstery", "Solid wood furniture", "LED ambient lighting"],
    breakdown: [
      { item: "Design & consultation", range: "₹8,000 – ₹15,000" },
      { item: "Furniture & seating", range: "₹25,000 – ₹45,000" },
      { item: "Lighting & decor", range: "₹7,000 – ₹15,000" },
      { item: "Labour & installation", range: "₹5,000 – ₹10,000" },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequest;
    // Use body to tailor response when connected to real AI/DB; for now return dummy.
    return NextResponse.json(DUMMY_QUOTE_RESPONSE);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
