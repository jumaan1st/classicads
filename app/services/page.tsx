import ServicesClient from "@/components/ServicesClient";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceRange: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  image: string;
  featured: boolean;
};

export default async function ServicesPage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Fetch initial services and content concurrently
  const [contentRes, servicesRes] = await Promise.all([
    fetch(`${baseUrl}/api/pages?slug=services`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/services?page=1&limit=100`, { next: { revalidate: 60 } }),
  ]);

  const rawContent = contentRes.ok ? await contentRes.json() : null;
  const initialContent = rawContent?.slug
    ? { title: rawContent.title, description: rawContent.description }
    : null;

  const rawServices = servicesRes.ok ? await servicesRes.json() : null;
  const initialServices: Service[] = rawServices?.services ?? [];

  return (
    <ServicesClient
      initialServices={initialServices}
      initialContent={initialContent}
    />
  );
}
