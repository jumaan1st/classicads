export interface PageContent {
  id: string;
  slug: string;
  title: string;
  description: string;
  metaDescription?: string;
  updatedAt: string;
}

let PAGES: PageContent[] = [
  {
    id: "1",
    slug: "home",
    title: "Transform Your Space",
    description:
      "Premium interior and exterior design. From concept to completion — we bring vision to life. Explore our services, see recent projects, and get in touch for a quote.",
    metaDescription: "Premium interior and exterior design. Get a quote and transform your space.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "services",
    title: "Our Services",
    description:
      "We offer a full range of interior and exterior design services — from living room makeovers and kitchen renovations to facade painting and landscape design. Each project is tailored to your budget and timeline.",
    metaDescription: "Interior design, kitchen renovation, exterior paint, landscape design, and consultation.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "about",
    title: "About ClassicAds",
    description:
      "ClassicAds has been delivering high-quality interior and exterior design solutions for years. Our team of designers and project managers works closely with you to turn your vision into reality. We combine creativity with practical execution and transparent pricing.",
    metaDescription: "Learn about our design team and approach.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    slug: "contact",
    title: "Contact Us",
    description:
      "Reach out via WhatsApp for the fastest response. Share your service interest, area, and query — we'll get back to you within 24 hours. You can also email us for formal enquiries.",
    metaDescription: "Contact ClassicAds via WhatsApp or email.",
    updatedAt: new Date().toISOString(),
  },
];

export function getPages(): PageContent[] {
  return PAGES;
}

export function getPageBySlug(slug: string): PageContent | undefined {
  return PAGES.find((p) => p.slug === slug);
}

export function updatePageBySlug(
  slug: string,
  updates: Partial<Pick<PageContent, "title" | "description" | "metaDescription">>
): PageContent | undefined {
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) return undefined;
  if (updates.title !== undefined) page.title = updates.title;
  if (updates.description !== undefined) page.description = updates.description;
  if (updates.metaDescription !== undefined) page.metaDescription = updates.metaDescription;
  page.updatedAt = new Date().toISOString();
  return page;
}

export function setPages(p: PageContent[]) {
  PAGES = p;
}

export function getPagesRef(): PageContent[] {
  return PAGES;
}
