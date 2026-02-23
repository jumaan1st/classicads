import { NextResponse } from "next/server";

// Dummy config. Replace with DB or env when integrating.
const CONFIG = {
  whatsappNumber: "9886262303", // Classic Advertisers
  whatsappCountryCode: "91",
};

export async function GET() {
  const number = CONFIG.whatsappCountryCode + CONFIG.whatsappNumber.replace(/\D/g, "");
  return NextResponse.json({
    whatsappNumber: number,
    whatsappUrl: `https://wa.me/${number}`,
  });
}
