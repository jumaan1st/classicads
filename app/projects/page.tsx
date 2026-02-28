import ProjectsClient from "@/components/ProjectsClient";

type Service = { id: string; name: string };
type Project = {
  id: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  content?: string;
  serviceIds: string[];
  progressPhotos?: { url: string }[];
};

export default async function ProjectsPage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Fetch initial projects and services on the server
  const [projectsRes, servicesRes] = await Promise.all([
    fetch(`${baseUrl}/api/projects?expand=employees&page=1&limit=100`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/services`, { next: { revalidate: 60 } }),
  ]);

  const rawProjects = projectsRes.ok ? await projectsRes.json() : null;
  const initialProjects: Project[] = rawProjects?.projects ?? [];

  const rawServices = servicesRes.ok ? await servicesRes.json() : null;
  const servicesList: Service[] = rawServices?.services ?? [];

  // Convert services list to map
  const initialServicesMap: Record<string, string> = {};
  servicesList.forEach((s) => {
    initialServicesMap[s.id] = s.name;
  });

  return (
    <ProjectsClient
      initialProjects={initialProjects}
      initialServicesMap={initialServicesMap}
    />
  );
}
