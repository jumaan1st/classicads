import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MainWrap from "@/components/MainWrap";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ClassicAds — Interior & Exterior Design",
  description: "Premium interior and exterior design services. Get a quote, manage projects, and transform your space.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.classList.add(t);else document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <Nav />
          <MainWrap>{children}</MainWrap>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
