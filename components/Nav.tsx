"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

import { Home, Sofa, Brush, Users, FileSignature, PhoneCall, LayoutDashboard, LogIn, LogOut, Menu, X, Moon, Sun } from "lucide-react";

const mainNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Sofa },
  { href: "/projects", label: "Projects", icon: Brush },
  { href: "/about", label: "About", icon: Users },
  { href: "/contact", label: "Contact", icon: PhoneCall },
];

export default function Nav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const topRowRef = useRef<HTMLDivElement>(null);
  const [topRowHeight, setTopRowHeight] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Measure the top row height for the sliding animation
    if (topRowRef.current) {
      setTopRowHeight(topRowRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (topRowRef.current) {
        setTopRowHeight(topRowRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // Track scroll direction
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsScrollingDown(false); // At the very top, always show both layers
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true); // Scrolling down, hide the top layer
      } else if (currentScrollY < lastScrollY.current - 15) {
        setIsScrollingDown(false); // Scrolling up, reveal the top layer
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/login")) return null;

  return (
    <header
      // Add dynamic transform depending on scroll state
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out"
      style={{
        transform: (isScrollingDown && !open) ? `translateY(-${topRowHeight}px)` : "translateY(0)"
      }}
    >
      <div
        ref={topRowRef}
        className="bg-[var(--background)] relative z-20 border-b border-[var(--border)]"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {/* TOP ROW (Logo, Contact Button, Controls) */}
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 md:px-8">

          <div className="flex items-center gap-6 xl:gap-8">
            <Link
              href="/"
              className="flex items-center font-heading font-bold tracking-tight text-[var(--foreground)] transition-smooth"
            >
              <span className="text-xl md:text-2xl mt-0.5">Classic<span className="text-blue-600 dark:text-blue-500">Ads</span></span>
            </Link>

            {/* DESKTOP NAV (Text + Icons) - xl and up */}
            <ul className="hidden xl:flex items-center gap-1 xl:gap-2">
              {mainNavLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-medium transition-smooth ${isActive
                        ? "text-blue-600 dark:text-blue-500 font-semibold"
                        : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-blue-600 dark:hover:text-blue-500"
                        }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CONTROLS (Theme, Dashboard, Login, Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-[var(--foreground)] transition-smooth hover:bg-[var(--muted-bg)] border border-transparent hover:border-[var(--border)]"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
            </button>

            {/* Login/Dashboard - Desktop/Tablet Only */}
            <div className="hidden md:flex items-center gap-2 xl:gap-3">
              {isLoggedIn && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl px-2 xl:px-4 py-2 text-[14px] xl:text-[15px] font-medium text-[var(--muted)] transition-smooth hover:bg-[var(--muted-bg)] hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Dashboard
                </Link>
              )}
              {isLoggedIn ? (
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[15px] font-medium text-[var(--danger)] hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm"
                >
                  <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                  Logout
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-[15px] font-semibold transition-smooth shadow-sm hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger - Mobile Only */}
            <button
              type="button"
              className="md:hidden rounded-xl p-2.5 text-[var(--foreground)] transition-smooth hover:bg-[var(--muted-bg)]"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
            >
              <Menu className="h-[22px] w-[22px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLET NAV ROW (Icons only with light background - shown on md to lg) */}
      <div className="hidden md:block xl:hidden bg-[var(--background)] border-b border-[var(--border)]">
        <ul className="flex items-center justify-center gap-4 xl:gap-6 max-w-[1400px] mx-auto px-4 py-2.5">
          {mainNavLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium transition-smooth ${isActive
                    ? "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/30"
                    : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-blue-600 dark:hover:text-blue-500"
                    }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MOBILE NAV (Icons only - Two layer style, shown only on < md) */}
      <div className="md:hidden bg-[var(--background)] border-b border-[var(--border)] px-2 py-3 relative z-10 shadow-sm transition-smooth mt-px">
        <ul className="flex items-center justify-around max-w-sm mx-auto">
          {mainNavLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  className={`flex items-center justify-center p-2.5 rounded-[14px] transition-smooth ${isActive
                    ? "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/30"
                    : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-blue-600 dark:hover:text-blue-500"
                    }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 z-30 bg-black/5 dark:bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            className="md:hidden absolute left-0 right-0 top-[100%] bg-[var(--background)] border-b border-[var(--border)] shadow-md z-40 flex flex-col px-5 py-6 gap-2"
          >
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex justify-between items-center">
              Account
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-smooth"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <ul className="flex flex-col gap-2 relative">
              {isLoggedIn && (
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[var(--muted)] border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] transition-smooth"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                </li>
              )}
              {isLoggedIn ? (
                <li>
                  <Link
                    href="/api/auth/logout"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--danger)] px-4 py-3.5 text-[15px] font-medium transition-all hover:bg-red-500/10 hover:border-red-500/20 shadow-sm w-full mt-2"
                    onClick={() => setOpen(false)}
                  >
                    <LogOut className="h-5 w-5" strokeWidth={1.5} />
                    Logout
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] px-4 py-3.5 text-[15px] font-semibold transition-smooth hover:opacity-90 w-full mt-2"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn className="h-5 w-5" strokeWidth={1.5} />
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
