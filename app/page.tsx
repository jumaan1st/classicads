import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import MapEmbed from "@/components/MapEmbed";
import { db } from "@/db";
import { businessProfile, projects, services, projectPhotos } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { getPageBySlug, type PageContent } from "@/app/api/pages/store";
import { unstable_cache } from "next/cache";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  priceRange: { min: number; max: number };
};

type Project = {
  id: string;
  title: string;
  clientName: string;
  image: string;
};

type HomeResponse = {
  pageContent: {
    description: string;
    totalProjects: number;
    yearsOfExperience: number;
  };
  services: Service[];
  projects: Project[];
  mapData: {
    mapEmbedUrl: string;
    shopName: string;
  };
};

const getHomePageData = unstable_cache(async () => {
  const profileRows = await db.select().from(businessProfile).limit(1);
  const profile = profileRows[0];

  const projectCountRow = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const totalProjects = Number(projectCountRow[0]?.count || 0);

  let yearsOfExperience = 10;
  if (profile?.startedBusinessAt) {
    yearsOfExperience = new Date().getFullYear() - profile.startedBusinessAt.getFullYear();
  }

  const rawServices = await db.select().from(services).where(eq(services.isDeleted, false)).limit(10);
  const serviceList: Service[] = rawServices.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description || "",
    image: s.image || "",
    priceRange: { min: s.minPrice || 0, max: s.maxPrice || 0 },
  }));

  const rawProjects = await db.select().from(projects).where(eq(projects.isDeleted, false)).orderBy(desc(projects.createdAt)).limit(10);
  const projectIds = rawProjects.map(p => p.id);

  let allPhotos: any[] = [];
  if (projectIds.length > 0) {
    allPhotos = await db.select().from(projectPhotos).where(inArray(projectPhotos.projectId, projectIds));
  }

  const projectList: Project[] = rawProjects.map((p) => {
    const pP = allPhotos.filter(photo => photo.projectId === p.id);
    return {
      id: p.id,
      title: p.title,
      clientName: p.clientName || "Client",
      image: pP.length > 0 ? pP[0].url : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    };
  });

  return { profile, totalProjects, yearsOfExperience, serviceList, projectList };
}, ['home-page-data'], { revalidate: 60, tags: ['home'] });

export const dynamic = 'force-dynamic';
export default async function Home() {
  const page = getPageBySlug("home") as PageContent | null;
  const { profile, totalProjects, yearsOfExperience, serviceList, projectList } = await getHomePageData();

  const mapData = {
    mapEmbedUrl: profile?.mapEmbedUrl || "",
    shopName: profile?.shopName || "Our Shop",
  };

  const pageContent = {
    description: page?.description || "",
    totalProjects,
    yearsOfExperience,
  };

  const threeServices = serviceList.slice(0, 3);
  const sixProjects = projectList.slice(0, 4);

  return (
    <div className="bg-[var(--background)] selection:bg-blue-500/30">
      {/* 1. HERO SECTION - unchanged (kept exactly as you had) */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 h-[300px] w-[300px] md:h-[600px] md:w-[600px] rounded-full bg-blue-500/10 blur-[150px]" />

        <div className="relative z-10 px-4 sm:px-5 text-center max-w-5xl mx-auto flex flex-col items-center pt-12 pb-16 sm:pt-16 md:pt-24 md:pb-20">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--border)] bg-[var(--background)] shadow-sm mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-full">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] truncate">Premium Layouts & Architectural Design</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-[var(--foreground)] leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            Beyond Structures,<br />
            We Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Masterpieces.</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl max-w-2xl text-[var(--muted)] leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {pageContent?.description ?? "From concept to completion, ClassicAds delivers unparalleled interior and exterior design solutions tailored directly to your vision."}
          </p>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link href="/contact" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-smooth shadow-lg shadow-[var(--shadow)]">
              Contact Us
            </Link>
            <Link href="/projects" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-[var(--muted-bg)] transition-smooth">
              View Portfolio <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SERVICES BENTO GRID - unchanged */}
      <section className="py-16 sm:py-24 px-4 sm:px-5 max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)]">Engineering Elegance.</h2>
          <p className="text-[var(--muted)] mt-3 sm:mt-4 text-base sm:text-lg">We provide an end-to-end design array that blends modern aesthetics with profound utility and seamless layouts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {threeServices.length > 0 && (
            <Link href={`/services/${threeServices[0]?.slug}`} className="md:col-span-2 relative rounded-[1.5rem] sm:rounded-3xl overflow-hidden group border border-[var(--border)] aspect-[3/2] md:aspect-auto md:min-h-[380px]">
              <Image src={threeServices[0]?.image} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" alt="Service 1" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 sm:p-10 w-full">
                <div className="bg-blue-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-2.5 sm:px-3 rounded-md w-max mb-2 sm:mb-4">Featured Service</div>
                <h3 className="text-xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-1 sm:mb-2">{threeServices[0]?.name}</h3>
                <p className="text-white/80 max-w-md line-clamp-2 text-xs sm:text-base md:text-lg">{threeServices[0]?.description}</p>
              </div>
            </Link>
          )}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
            {threeServices.slice(1, 3).map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="relative rounded-[1.5rem] sm:rounded-3xl overflow-hidden group border border-[var(--border)] aspect-square md:aspect-auto md:flex-1 md:min-h-[175px]">
                <Image src={s.image} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" alt={s.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-6 md:p-8 w-full">
                  <h3 className="text-sm sm:text-xl md:text-2xl font-heading font-bold text-white mb-0.5 sm:mb-1 leading-tight">{s.name}</h3>
                  <p className="text-white/70 text-[10px] sm:text-sm hidden xs:block">Starting at ₹{s.priceRange.min.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. METRICS - unchanged */}
      <section className="py-16 sm:py-24 border-y border-[var(--border)] bg-[var(--section)] relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 grid lg:grid-cols-2 gap-12 sm:gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4 sm:mb-6">Why We Stand Out.</h2>
            <p className="text-[var(--muted)] text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              At ClassicAds, we don't just decorate spaces—we engineer dynamic environments. With an incredible success rate and hundreds of transformed locations, our process guarantees precision and prestige perfectly aligned with your website builder aesthetic.
            </p>
            <ul className="space-y-4 sm:space-y-5 inline-block text-left">
              {['Uncompromising Quality Standards', 'Transparent Upfront Pricing & Analytics', 'Dedicated Elite Project Managers'].map(item => (
                <li key={item} className="flex items-start sm:items-center gap-3 sm:gap-4 text-[var(--foreground)] font-semibold text-base sm:text-lg">
                  <div className="flex bg-[var(--background)] p-1.5 rounded-full border border-[var(--border)] shadow-sm shrink-0 mt-0.5 sm:mt-0">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 lg:mt-0">
            <div className="bg-[var(--background)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] mb-1 sm:mb-2 w-full">{pageContent.totalProjects}+</span>
              <span className="text-[var(--muted)] text-[10px] sm:text-sm uppercase tracking-wider font-bold">Projects</span>
            </div>
            <div className="bg-[var(--background)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] mb-1 sm:mb-2 w-full">{pageContent.yearsOfExperience}+</span>
              <span className="text-[var(--muted)] text-[10px] sm:text-sm uppercase tracking-wider font-bold">Years Exp.</span>
            </div>
            <div className="bg-[var(--background)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] mb-1 sm:mb-2 w-full">100%</span>
              <span className="text-[var(--muted)] text-[10px] sm:text-sm uppercase tracking-wider font-bold">Client Focus</span>
            </div>
            <div className="bg-[var(--background)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] mb-1 sm:mb-2 w-full">24/7</span>
              <span className="text-[var(--muted)] text-[10px] sm:text-sm uppercase tracking-wider font-bold">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS - unchanged */}
      <section className="py-16 sm:py-24 px-4 sm:px-5 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6 pt-6 sm:pt-10 text-center md:text-left">
          <div className="max-w-xl mx-auto md:mx-0">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)]">Recent Triumphs.</h2>
            <p className="text-[var(--muted)] mt-3 sm:mt-4 text-base sm:text-lg">Explore a curated selection of our most prestigious design projects.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Link href="/projects" className="inline-flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[var(--foreground)] font-semibold hover:bg-[var(--muted-bg)] transition-colors shadow-sm text-sm sm:text-base">
              See All Work <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {sixProjects.map(p => (
            <Link href={`/projects`} key={p.id} className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] aspect-[4/3] shadow-sm">
              <Image src={p.image} fill className="object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-90" alt={p.title} />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                  <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded backdrop-blur-md border border-blue-500/20">Featured</span>
                  <span className="text-white/80 font-medium text-[10px] uppercase tracking-widest bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded backdrop-blur-md border border-white/10">{p.clientName}</span>
                </div>
                <h3 className="font-heading text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">{p.title}</h3>
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-white/90 font-medium text-sm sm:opacity-0 sm:h-0 sm:overflow-hidden sm:mt-0 sm:pt-0 sm:border-0 sm:group-hover:opacity-100 sm:group-hover:h-auto sm:group-hover:mt-4 sm:group-hover:pt-4 sm:group-hover:border-t transition-all duration-300">
                  Explore Case Study <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION & LOCATION - NOW DYNAMIC */}
      <section className="py-24 px-5">
        <div className="max-w-7xl mx-auto relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[var(--section)] border border-[var(--border)] p-8 md:p-16 lg:p-24 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative z-10 text-center lg:text-left">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 tracking-tight">
                Stop Settling.<br />Start Creating.
              </h2>
              <p className="text-lg md:text-xl text-[var(--muted)] max-w-xl mx-auto lg:mx-0 mb-10">
                Book a free consultation today and let our design experts craft exactly what you need. A full-service construction and design agency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/contact" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-[14px] font-semibold text-base transition-smooth shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]">
                  Contact Us Now
                </Link>
                <Link href="/projects" className="w-full sm:w-auto bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted-bg)] text-[var(--foreground)] px-8 py-3.5 rounded-[14px] font-semibold text-base transition-smooth shadow-sm">
                  View Portfolio
                </Link>
              </div>
            </div>

            <div className="relative z-10 w-full aspect-square md:aspect-video lg:aspect-square max-h-[500px]">
              <MapEmbed
                mapEmbedUrl={mapData.mapEmbedUrl}
                title={mapData.shopName}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}