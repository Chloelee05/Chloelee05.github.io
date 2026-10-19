import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb", display: "swap" });

const title = "Hae Eun Lee — AI & Software Engineer";
const description =
  "Portfolio of Hae Eun Lee, an AI & Software Engineer in Singapore specializing in intelligent systems, full-stack development, and scalable digital experiences.";

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: "Hae Eun Lee" }],
  keywords: ["Hae Eun Lee", "AI Engineer", "Software Engineer", "Singapore", "LangGraph", "FastAPI", "Next.js"],
  openGraph: { title, description, type: "website", locale: "en_SG" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = { themeColor: "#FAFAFA", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hae Eun Lee",
  jobTitle: "AI & Software Engineer",
  email: "mailto:haeeunlee2005@gmail.com",
  address: { "@type": "PostalAddress", addressCountry: "SG" },
  alumniOf: "University of Wollongong",
  sameAs: [
    "https://github.com/Chloelee05",
    "https://www.linkedin.com/in/hae-eun-lee-169baa2b2",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <noscript>
          <style>{`[style*="opacity"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
