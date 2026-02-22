import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Folder, DollarSign, CheckCircle2, Circle } from 'lucide-react';

async function getProject(id: string) {
    try {
        const res = await fetch(`http://localhost:3000/api/projects?id=${id}&expand=employees`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

async function getServices() {
    try {
        const res = await fetch(`http://localhost:3000/api/services`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.services ?? [];
    } catch {
        return [];
    }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    const allServices = await getServices();
    const connectedServices = allServices.filter((s: any) => project.serviceIds.includes(s.id));

    return (
        <div className="bg-[var(--background)] min-h-screen pt-12 md:pt-16 pb-24">
            {/* Article Header */}
            <article className="max-w-4xl mx-auto px-5 sm:px-6">
                {/* Back link + status on one row */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to projects
                    </Link>
                    {(() => {
                        const s = project.status.toLowerCase();
                        const isActive = s === 'active';
                        const isDone = s === 'completed';
                        const isProgress = s.includes('progress');
                        const dotCls = isActive ? 'bg-emerald-400 animate-pulse'
                            : isDone ? 'bg-blue-400'
                                : isProgress ? 'bg-amber-400 animate-pulse'
                                    : 'bg-gray-400';
                        const pillCls = isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : isDone ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                : isProgress ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-[var(--muted-bg)] text-[var(--muted)] border-[var(--border)]';
                        return (
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${pillCls}`}>
                                <span className={`h-2 w-2 rounded-full ${dotCls}`} />
                                {project.status.replace(/_/g, ' ')}
                            </span>
                        );
                    })()}
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] leading-tight mb-6">
                    {project.title}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[var(--border)] mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                            <User className="h-4 w-4" /> <span className="text-sm font-medium">Client</span>
                        </div>
                        <div className="font-semibold text-[var(--foreground)]">{project.clientName}</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                            <Calendar className="h-4 w-4" /> <span className="text-sm font-medium">Timeline</span>
                        </div>
                        <div className="font-semibold text-[var(--foreground)]">
                            {project.startDate} — {project.endDate || 'Present'}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                            <DollarSign className="h-4 w-4" /> <span className="text-sm font-medium">Budget</span>
                        </div>
                        {project.budget ? (
                            <div className="font-semibold text-[var(--foreground)]">₹{project.budget.toLocaleString()}</div>
                        ) : (
                            <Link href="/contact" className="font-semibold text-blue-500 hover:underline text-sm">Contact us</Link>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
                            <Folder className="h-4 w-4" /> <span className="text-sm font-medium">Team</span>
                        </div>
                        <div className="font-semibold text-[var(--foreground)]">
                            {project.assignedEmployeeNames?.map((e: any) => e.name).join(', ') || 'Unassigned'}
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                {project.progressPhotos && project.progressPhotos.length > 0 && (
                    <div className="relative aspect-[16/9] md:aspect-[2/1] w-full rounded-3xl overflow-hidden mb-16 shadow-xl border border-[var(--border)]">
                        <Image
                            src={project.progressPhotos[0].url}
                            alt={project.progressPhotos[0].caption || project.title}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Content Body */}
                <div className="grid md:grid-cols-[1fr_300px] gap-12 md:gap-16 items-start">
                    <div className="prose prose-lg dark:prose-invert prose-headings:font-heading prose-a:text-blue-600 dark:prose-a:text-blue-400 max-w-none">
                        <h2 className="text-2xl font-bold mb-4">The Challenge & Solution</h2>
                        {project.content.split('\\n\\n').map((paragraph: string, i: number) => (
                            <p key={i} className="text-[var(--muted)] leading-relaxed mb-6">{paragraph}</p>
                        ))}

                        {project.progressPhotos && project.progressPhotos.length > 1 && (
                            <div className="mt-12">
                                <h3 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Gallery</h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {project.progressPhotos.map((photo: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-[var(--border)]">
                                                <Image src={photo.url} alt={photo.caption} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--muted)]">{photo.caption}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Milestones */}
                    <div className="sticky top-[100px]">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">

                            {/* Services used */}
                            {connectedServices.length > 0 && (
                                <div className="mb-6 pb-6 border-b border-[var(--border)]">
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--muted)] mb-3">Services</h3>
                                    <div className="flex flex-col gap-2">
                                        {connectedServices.map((s: any) => (
                                            <Link
                                                key={s.id}
                                                href={`/services/${s.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                {s.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h3 className="font-bold text-lg text-[var(--foreground)] mb-6 font-heading">Project Milestones</h3>
                            <div className="space-y-6">
                                {project.milestones.map((milestone: any, i: number) => (
                                    <div key={milestone.id} className="relative flex gap-4 items-start">
                                        {/* Connector Line */}
                                        {i !== project.milestones.length - 1 && (
                                            <div className={`absolute left-2.5 top-6 bottom-[-24px] w-[2px] ${milestone.completed ? 'bg-blue-500' : 'bg-[var(--border)]'}`} />
                                        )}
                                        <div className="relative z-10 bg-[var(--card)] mt-0.5">
                                            {milestone.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-[var(--muted)]" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-semibold ${milestone.completed ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                                                {milestone.title}
                                            </span>
                                            <span className="text-xs font-medium text-[var(--muted)] mt-1">
                                                {milestone.completed ? `Completed ${milestone.completedAt}` : `Due ${milestone.dueDate}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg text-center">
                            <h3 className="font-bold font-heading text-xl mb-3">Ready for a similar project?</h3>
                            <p className="text-white/80 text-sm mb-6 leading-relaxed">Let&apos;s discuss bringing your vision to life.</p>
                            <Link href="/contact" className="block w-full text-blue-900 bg-white hover:bg-white/90 font-bold py-3 rounded-xl transition-all hover:scale-105">
                                Book Consultation
                            </Link>
                        </div>
                    </div>
                </div>

            </article>
        </div>
    );
}
