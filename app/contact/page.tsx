import WhatsAppContact from "@/components/WhatsAppContact";
import MapEmbed from "@/components/MapEmbed";

type PageContent = {
  title: string;
  description: string;
};

type ContactDetails = {
  phone: string | null;
  email: string | null;
  mapEmbedUrl: string | null;
  shopName: string | null;
};

export default async function ContactPage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Fetch page content and contact details concurrently on the server
  const [contentRes, contactRes] = await Promise.all([
    fetch(`${baseUrl}/api/pages?slug=contact`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/contact-details`, { next: { revalidate: 60 } }),
  ]);

  const rawContent = contentRes.ok ? await contentRes.json() : null;
  const content = rawContent?.slug ? (rawContent as PageContent) : null;

  const contactDetails = contactRes.ok ? ((await contactRes.json()) as ContactDetails) : null;

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 pt-10 sm:pt-12 pb-12 md:pb-20 flex-grow">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {content?.title ?? "Contact Us"}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">Get in touch and let's start building your dream space.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

          {/* Left Column: Form Card */}
          <div className="flex flex-col">
            <div className="mt-0 p-8 md:p-10 shadow-2xl border border-[var(--border)] rounded-[2rem] bg-[var(--card)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

              <div className="relative z-10">
                <h2 className="mb-4 font-heading text-2xl font-bold text-[var(--foreground)]">
                  Send a message via WhatsApp
                </h2>
                <p className="mb-8 text-[15px] leading-relaxed text-[var(--muted)]">
                  Choose a service and area if applicable, then type your message. You’ll be redirected to WhatsApp with
                  everything pre-filled.
                </p>
                {/* Client Component */}
                <WhatsAppContact phone={contactDetails?.phone} />
              </div>
            </div>

            <p className="mt-8 text-sm md:text-base text-center md:text-left leading-relaxed text-[var(--muted)] px-2">
              {content?.description ??
                "Reach out via WhatsApp for the fastest response. Share your service interest, area, and query to get started with ClassicAds."}
            </p>
          </div>

          {/* Right Column: Map Embed */}
          <div className="flex flex-col h-full w-full aspect-square md:aspect-auto md:min-h-[500px]">
            <MapEmbed
              mapEmbedUrl={contactDetails?.mapEmbedUrl}
              title={contactDetails?.shopName ?? "Business Location"}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
