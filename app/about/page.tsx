"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Users, Target, Sparkles, CheckCircle2, Zap, Shield, Star } from "lucide-react";

type PageContent = { title: string; description: string };

const STATS = [
  { value: "200+", label: "Projects Delivered" },
  { value: "12+", label: "Years of Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Expert Designers" },
];

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

export default function AboutPage() {
  const [content, setContent] = useState<PageContent | null>(null);

  useEffect(() => {
    fetch("/api/pages?slug=about")
      .then((r) => r.json())
      .then((d) => (d.slug ? setContent(d) : setContent(null)))
      .catch(() => setContent(null));
  }, []);

  return (
    <div className="bg-[var(--background)] min-h-screen">

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] pt-12 pb-16 sm:pt-20 md:pt-28 md:pb-24">
        {/* Grid bg */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--border)] bg-[var(--background)] shadow-sm mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full">
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">Award-Winning Design Agency</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--foreground)] leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            {content?.title ?? "We Design Spaces,"}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              We Build Legacies.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-[var(--muted)] leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {content?.description ??
              "ClassicAds has been transforming interiors and exteriors for over a decade. We engineer environments that inspire, function, and endure — built around your vision."}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
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
      </section>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--section)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {STATS.map((s) => (
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

      {/* ── STORY ───────────────────────────────────────── */}
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
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {[
              { icon: Target, title: "Precision", desc: "Every angle meticulously calculated.", shifted: false },
              { icon: Users, title: "Collaboration", desc: "Your vision, amplified by our expertise.", shifted: true },
              { icon: Sparkles, title: "Innovation", desc: "Designs that define the future.", shifted: false },
              { icon: Award, title: "Excellence", desc: "Award-winning quality, every time.", shifted: true },
            ].map(({ icon: Icon, title, desc, shifted }) => (
              <div
                key={title}
                className={`bg-[var(--section)] p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--border)] flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 ${shifted ? "sm:translate-y-6" : ""}`}
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

      {/* ── VALUES ──────────────────────────────────────── */}
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
                <div className="text-xs font-black text-[var(--muted)] uppercase tracking-widest mb-2">
                  0{idx + 1}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-3">{title}</h3>
                <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl bg-[var(--section)] border border-[var(--border)] rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-sm">
          {/* Accent glows */}
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
              Schedule a comprehensive consultation with our lead designers today. We'll bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base hover:bg-[var(--muted-bg)] transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
