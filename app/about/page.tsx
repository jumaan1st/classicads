"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Award, Users, Target } from "lucide-react";

type PageContent = { title: string; description: string };

export default function AboutPage() {
  const [content, setContent] = useState<PageContent | null>(null);

  useEffect(() => {
    fetch("/api/pages?slug=about")
      .then((r) => r.json())
      .then((d) => (d.slug ? setContent(d) : setContent(null)))
      .catch(() => setContent(null));
  }, []);

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      {/* 1. PREMIUM HEADER SECTION */}
      <section className="relative overflow-hidden border-b border-[var(--border)] pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] shadow-sm mb-6 max-w-full">
            <Award className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm font-medium text-[var(--foreground)] truncate">Award-Winning Design Agency</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)]">
            {content?.title ?? "About ClassicAds"}
          </h1>
          <p className="mt-4 text-lg md:text-xl leading-relaxed text-[var(--muted)]">
            {content?.description ??
              "ClassicAds has been delivering high-quality interior and exterior design solutions for years. We engineer environments that inspire, function, and endure."}
          </p>
        </div>
      </section>

      {/* 2. OUR STORY & MISSION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
              Our Vision & Story.
            </h2>
            <div className="space-y-6 text-lg text-[var(--muted)] leading-relaxed">
              <p>
                Founded on the principle that spaces should dictate emotion and utility simultaneously, ClassicAds began as a small architectural consultancy and rapidly grew into a full-scale premium design agency.
              </p>
              <p>
                We do not just decorate rooms; we architect atmospheres. From sprawling commercial office spaces to intimate luxury residential interiors, our team of dedicated experts ensures that every inch of your property is optimized for maximum aesthetic and practical value.
              </p>
              <p>
                Our commitment to uncompromising quality means we use only the best materials, partner with top-tier contractors, and provide entirely transparent analytics and pricing from day one.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--section)] p-8 rounded-3xl border border-[var(--border)] flex flex-col justify-center text-center aspect-square shadow-sm">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Precision</h3>
              <p className="text-sm text-[var(--muted)]">Every angle calculated.</p>
            </div>
            <div className="bg-[var(--section)] p-8 rounded-3xl border border-[var(--border)] flex flex-col justify-center text-center aspect-square shadow-sm translate-y-8">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Collaboration</h3>
              <p className="text-sm text-[var(--muted)]">Your vision, our expertise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="bg-[var(--section)] border-y border-[var(--border)] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">Values That Drive Us</h2>
            <p className="text-[var(--muted)] text-lg">We hold ourselves to the highest standards because your space deserves nothing less.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: "Innovation", desc: "Pushing the boundaries of modern design and sustainable architecture." },
              { title: "Integrity", desc: "Complete transparency in timelines, budgets, and material sourcing." },
              { title: "Excellence", desc: "A relentless pursuit of perfection in every brushstroke and blueprint." }
            ].map((val, idx) => (
              <div key={idx} className="bg-[var(--background)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <span className="font-heading text-xl font-black text-blue-500">{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{val.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-24 px-5 max-w-4xl mx-auto text-center flex-grow">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-6">Ready to transform your space?</h2>
        <p className="text-lg text-[var(--muted)] mb-10">Get in touch with our lead designers today to schedule a comprehensive consultation.</p>
        <Link href="/contact" className="inline-flex justify-center items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-smooth shadow-lg shadow-[var(--shadow)]">
          Contact Us <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}
