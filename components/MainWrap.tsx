"use client";

import { usePathname } from "next/navigation";

export default function MainWrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");
  return (
    <main className={`min-h-screen ${isDashboard ? "" : "pt-[130px] md:pt-[80px]"}`}>
      {children}
    </main>
  );
}
