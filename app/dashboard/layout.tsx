import { getSession } from "@/app/lib/db-session";
import { redirect } from "next/navigation";
import ClientLayout from "./ClientLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <ClientLayout user={{ id: session.id, email: session.email, role: session.role, name: "Master Admin" }}>
            {children}
        </ClientLayout>
    );
}
