import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { getPageContent, getFeaturedServices, getFeaturedProjects } from "@/app/lib/data";

export default async function Home() {
  const [pageContent, services, projects] = await Promise.all([
    getPageContent("home"),
    getFeaturedServices(),
    getFeaturedProjects(),
  ]);

  const threeServices = services.slice(0, 3);
  const sixProjects = projects.slice(0, 6);

  return (
    <div className="bg-[var(--background)]">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        {/* Subtle Decorative UI Pattern & Glow */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-0 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-[0.10] blur-[100px] md:h-[450px] md:w-[450px]" />
        <div className="absolute bottom-0 right-1/4 -z-0 h-[250px] w-[250px] rounded-full bg-[var(--foreground)] opacity-[0.03] blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-28 flex flex-col items-center text-center md:items-start md:text-left sm:px-6 sm:py-36 md:px-8 md:py-40">
          <h1 className="font-heading max-w-2xl text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {pageContent?.title ?? "Transform Your Space"}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            {pageContent?.description ??
              "Premium interior and exterior design. From concept to completion — we bring your vision to life."}
          </p>
          <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
            <Button href="/quote" variant="primary">
              Get a Quote
            </Button>
            <Button href="/services" variant="secondary">
              View Services
            </Button>
            <Button href="/projects" variant="ghost">
              View Our Work
            </Button>
            <Button href="/contact" variant="ghost">
              Contact via WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="border-y py-12 md:py-16"
        style={{ background: "var(--section)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-[var(--foreground)] md:text-4xl">50+</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Projects delivered</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-[var(--foreground)] md:text-4xl">8+</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Years experience</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-[var(--foreground)] md:text-4xl">6</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Service categories</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-[var(--foreground)] md:text-4xl">100%</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Client-focused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col items-center text-center md:items-start md:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
            Our Services
          </h2>
          <p className="mt-3 text-lg text-[var(--muted)]">
            Interior, exterior, and consultation — tailored to your space and budget.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {threeServices.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`} className="group block">
              <Card className="overflow-hidden transition-smooth hover:border-[var(--muted)]/40">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--background) 20%, transparent 50%)",
                    }}
                  />
                  <span className="absolute bottom-4 left-4 text-sm font-semibold text-[var(--foreground)]">
                    ₹{s.priceRange.min.toLocaleString()} – ₹{s.priceRange.max.toLocaleString()}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--muted)]">
                    {s.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-[var(--muted)]">
                    {s.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href="/services" variant="secondary">
            View All Services
          </Button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="border-y py-20 md:py-28"
        style={{ background: "var(--section)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
              Why Choose Us
            </h2>
            <p className="mt-3 text-lg text-[var(--muted)]">
              Quality, transparency, and a single point of contact from start to finish.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)]">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-[var(--foreground)]">Design to delivery</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
                One team handles concept, materials, and execution so nothing gets lost in handoff.
              </p>
            </div>
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)]">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-[var(--foreground)]">Clear pricing</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
                Get a quote up front. No hidden costs — we stick to the agreed scope and budget.
              </p>
            </div>
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)]">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-[var(--foreground)]">On-time completion</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
                We plan milestones and keep you updated so your project finishes when promised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects — all visible, no login */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col items-center text-center md:items-start md:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
            Recent Projects
          </h2>
          <p className="mt-3 text-lg text-[var(--muted)]">
            A glimpse of what we’ve delivered. Browse the full portfolio with no login required.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sixProjects.map((p) => (
            <Link key={p.id} href={`/projects`} className="group block">
              <Card className="overflow-hidden transition-smooth hover:border-[var(--muted)]/40">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--background) 20%, transparent 50%)",
                    }}
                  />
                  <span className="absolute bottom-4 left-4 text-sm font-semibold text-[var(--foreground)]">
                    {p.serviceName}
                  </span>
                  <span
                    className="absolute top-4 right-4 rounded-lg bg-[var(--card)]/90 px-2 py-1 text-xs font-medium text-[var(--muted)]"
                  >
                    {p.status}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--muted)]">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-[var(--muted)]">
                    {p.clientName} · {p.status}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href="/projects" variant="secondary">
            View All Projects
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section
        className="border-y py-20 md:py-28"
        style={{ background: "var(--section)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
          <div
            className="mx-auto max-w-2xl rounded-2xl border p-10 text-center md:p-14"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
              Ready to start your project?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
              Get a quote in minutes or contact us on WhatsApp with your service, area, and message.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/quote" variant="primary">
                Get a Quote
              </Button>
              <Button href="/contact" variant="secondary">
                Contact via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
