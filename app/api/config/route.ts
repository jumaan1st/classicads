import { NextResponse } from "next/server";

// Dummy config. Replace with DB or env when integrating.
const CONFIG = {
  whatsappNumber: "1234567890", // no + or country code in number for wa.me
  whatsappCountryCode: "1",
};

export async function GET() {
  const number = CONFIG.whatsappCountryCode + CONFIG.whatsappNumber.replace(/\D/g, "");
  return NextResponse.json({
    whatsappNumber: number,
    whatsappUrl: `https://wa.me/${number}`,
  });
}
