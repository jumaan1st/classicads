import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Users, Target, Sparkles, CheckCircle2, Zap, Shield, Star } from "lucide-react";
import { db } from "@/db";
import { businessProfile, projects } from "@/db/schema";
import { getPageBySlug, type PageContent } from "@/app/api/pages/store";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
type Profile = {
  ownerName?: string | null;
  shopName?: string | null;
  startedBusinessAt?: string | null;
  profileImage?: string | null;
  phone?: string | null;
};
type ProjectStats = { total: number };

const VALUES = [
  {
    icon: Zap,
    title: "Innovation",
    desc: "We push the boundaries of modern design, blending cutting-edge aesthetics with sustainable architectural thinking.",
  },
  {
    icon: Shield,
    title: "Integrity",
    desc: "Complete transparency in timelines, budgets, and material sourcing — no surprises, ever.",
  },
  {
    icon: Star,
    title: "Excellence",
    desc: "A relentless pursuit of perfection in every brushstroke, blueprint, and spatial decision we make.",
  },
];

function yearsOfExp(startedAt?: string | null): string {
  if (!startedAt) return "10+";
  const years = new Date().getFullYear() - new Date(startedAt).getFullYear();
  return `${years}+`;
}

const getAboutData = unstable_cache(async () => {
  const profileRows = await db.select().from(businessProfile).limit(1);
  const profile = profileRows[0] as Profile | undefined;

  const projectCountRow = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const totalProjects = Number(projectCountRow[0]?.count || 0);

  return { profile, totalProjects };
}, ['about-page-data'], { revalidate: 60, tags: ['about'] });

export const dynamic = 'force-dynamic';
export default async function AboutPage() {
  const content = getPageBySlug("about") as PageContent | null;
  const { profile, totalProjects } = await getAboutData();

  const stats = [
    { value: totalProjects > 0 ? `${totalProjects}+` : "10+", label: "Projects Delivered" },
    { value: yearsOfExp(profile?.startedBusinessAt), label: "Years of Experience" },
    { value: "100%", label: "Client Satisfaction" },
  ];

  const ownerName = profile?.ownerName || "Owner";
  const ownerImage = profile?.profileImage || null;

  return (
    <div className="bg-[var(--background)] min-h-screen">

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] pt-12 pb-16 sm:pt-20 md:pt-24 md:pb-24">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16 lg:gap-24">

            {/* Left: text */}
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] shadow-sm mb-6">
                <Award className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-[var(--foreground)]">Premium Interior &amp; Exterior Design</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.05] mb-4">
                {content?.title ?? "Crafting Beautiful"}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Spaces &amp; Interiors.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-xl mb-8">
                {content?.description ??
                  "ClassicAds delivers high-quality interior and exterior design tailored to your vision. Every project is handled personally — with care, skill, and transparency from start to finish."}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-6 sm:px-8 py-3.5 rounded-xl font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  Work With Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-6 sm:px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-[var(--muted-bg)] transition-all"
                >
                  View Portfolio
                </Link>
              </div>
            </div>

            {/* Right: owner photo */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-52 w-52 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-[2rem] overflow-hidden border-4 border-[var(--border)] shadow-2xl relative bg-[var(--muted-bg)]">
                  {ownerImage ? (
                    <Image
                      src={ownerImage}
                      alt={ownerName}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width:768px) 208px, 288px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl text-[var(--muted)] font-bold select-none">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Owner badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-2xl px-4 py-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-[var(--foreground)]">Owner · {profile?.shopName ?? "ClassicAds"}</span>
                </div>
              </div>
              {/* Name */}
              <div className="mt-6 text-center max-w-[260px]">
                <p className="font-heading text-xl font-bold text-[var(--foreground)]">{ownerName}</p>
                <p className="text-xs text-[var(--muted)] mt-1 italic">&ldquo;Your space, transformed with care.&rdquo;</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-b border-[var(--border)] bg-[var(--section)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <dt className="font-heading text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)]">
                  {s.value}
                </dt>
                <dd className="text-xs sm:text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mt-1">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Text */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-4">
              Our Story
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6 leading-tight">
              Built on craft, driven by passion.
            </h2>
            <div className="space-y-5 text-base sm:text-lg text-[var(--muted)] leading-relaxed">
              <p>
                Founded on the principle that spaces should dictate emotion and utility simultaneously, ClassicAds began as a small architectural consultancy and rapidly grew into a full-scale premium design agency.
              </p>
              <p>
                We don&apos;t just decorate rooms — we architect atmospheres. From sprawling commercial offices to intimate luxury residences, our experts ensure every inch is optimized for maximum aesthetic and practical value.
              </p>
              <p>
                Our commitment to quality means we use only the best materials, partner with top-tier contractors, and provide entirely transparent pricing from day one.
              </p>
            </div>

            <ul className="mt-8 space-y-3 w-full">
              {["Uncompromising Quality Standards", "Transparent Upfront Pricing", "Dedicated Project Managers", "On-Time, On-Budget Delivery"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[var(--foreground)] font-medium text-sm sm:text-base justify-center md:justify-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {[
              { icon: Target, title: "Precision", desc: "Every angle meticulously calculated." },
              { icon: Users, title: "Collaboration", desc: "Your vision, amplified by our expertise." },
              { icon: Sparkles, title: "Innovation", desc: "Designs that define the future." },
              { icon: Award, title: "Excellence", desc: "Award-winning quality, every time." },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[var(--section)] p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--border)] flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] mb-1">{title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-[var(--section)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-4">
              Our Values
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)]">
              Values That Drive Us
            </h2>
            <p className="mt-4 text-[var(--muted)] text-base sm:text-lg">
              We hold ourselves to the highest standards because your space deserves nothing less.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {VALUES.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="bg-[var(--background)] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-xs font-black text-[var(--muted)] uppercase tracking-widest mb-2">0{idx + 1}</div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-3">{title}</h3>
                <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl bg-[var(--section)] border border-[var(--border)] rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-sm">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6">
              Start Your Project
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4 leading-tight">
              Ready to transform <br className="hidden sm:block" />your space?
            </h2>
            <p className="text-base sm:text-lg text-[var(--muted)] mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Schedule a comprehensive consultation with our lead designers today. We&apos;ll bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/contact" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base hover:bg-[var(--muted-bg)] transition-all">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
