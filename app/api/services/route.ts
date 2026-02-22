import { NextResponse } from "next/server";

export type ServiceCategory = "interior" | "exterior" | "consultation";

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  priceRange: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  image: string;
  gallery: string[];
  materials: string[];
  featured: boolean;
}

const DUMMY_SERVICES: Service[] = [
  {
    id: "1",
    name: "Living Room Design",
    slug: "living-room-design",
    category: "interior",
    description: "Complete living room transformation with custom furniture, lighting, and color schemes tailored to your style.",
    priceRange: { min: 15000, max: 75000 },
    timelineWeeks: { min: 2, max: 6 },
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600",
    ],
    materials: ["Premium upholstery", "Solid wood", "Marble accents", "Custom lighting"],
    featured: true,
  },
  {
    id: "2",
    name: "Kitchen Renovation",
    slug: "kitchen-renovation",
    category: "interior",
    description: "Modern or classic kitchen design with premium cabinetry, countertops, and appliances.",
    priceRange: { min: 80000, max: 250000 },
    timelineWeeks: { min: 4, max: 12 },
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    ],
    materials: ["Quartz countertops", "Hardwood cabinets", "Stainless steel", "Backsplash tiles"],
    featured: true,
  },
  {
    id: "3",
    name: "Bedroom Makeover",
    slug: "bedroom-makeover",
    category: "interior",
    description: "Create a serene retreat with custom bedding, storage solutions, and ambient lighting.",
    priceRange: { min: 12000, max: 50000 },
    timelineWeeks: { min: 1, max: 4 },
    image: "https://images.unsplash.com/photo-1616594039964-ae902f2eea57?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1616594039964-ae902f2eea57?w=600",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    ],
    materials: ["Luxury linens", "Custom wardrobes", "Soft lighting", "Carpet/wood flooring"],
    featured: false,
  },
  {
    id: "4",
    name: "Facade & Exterior Paint",
    slug: "facade-exterior-paint",
    category: "exterior",
    description: "Professional exterior painting and facade restoration for lasting curb appeal.",
    priceRange: { min: 25000, max: 120000 },
    timelineWeeks: { min: 2, max: 6 },
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",
    ],
    materials: ["Weather-resistant paint", "Primer", "Sealant", "Decorative trim"],
    featured: true,
  },
  {
    id: "5",
    name: "Landscape Design",
    slug: "landscape-design",
    category: "exterior",
    description: "Garden design, hardscaping, and outdoor living spaces that extend your home.",
    priceRange: { min: 30000, max: 150000 },
    timelineWeeks: { min: 4, max: 16 },
    image: "https://images.unsplash.com/photo-1558904541-efa84396aec2?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1558904541-efa84396aec2?w=600",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
    ],
    materials: ["Natural stone", "Plants & shrubs", "Outdoor lighting", "Paving"],
    featured: false,
  },
  {
    id: "6",
    name: "Design Consultation",
    slug: "design-consultation",
    category: "consultation",
    description: "One-on-one consultation to define your style, budget, and project scope.",
    priceRange: { min: 2000, max: 8000 },
    timelineWeeks: { min: 0, max: 1 },
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    gallery: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600"],
    materials: ["Mood boards", "Sample swatches", "3D renders (optional)"],
    featured: false,
  },
  {
    id: "7",
    name: "Bathroom Remodeling",
    slug: "bathroom-remodeling",
    category: "interior",
    description: "Spa-like bathroom renovations including custom vanity, walk-in showers, and premium tiling.",
    priceRange: { min: 25000, max: 80000 },
    timelineWeeks: { min: 3, max: 8 },
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600",
    ],
    materials: ["Porcelain tiles", "Glass enclosures", "Rain showers", "Floating vanities"],
    featured: false,
  },
  {
    id: "8",
    name: "Commercial Office Design",
    slug: "commercial-design",
    category: "interior",
    description: "Productivity-focused workspace layouts combining ergonomic furniture with corporate branding.",
    priceRange: { min: 100000, max: 500000 },
    timelineWeeks: { min: 6, max: 20 },
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600",
    ],
    materials: ["Acoustic panels", "Ergonomic seating", "Glass partitions", "Commercial carpet"],
    featured: true,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const slug = searchParams.get("slug");

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "6", 10);

  if (slug) {
    const service = DUMMY_SERVICES.find((s) => s.slug === slug);
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(service);
  }

  let data = [...DUMMY_SERVICES];
  if (category) data = data.filter((s) => s.category === category);
  if (featured === "true") data = data.filter((s) => s.featured);

  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return NextResponse.json({
    services: paginatedData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}
