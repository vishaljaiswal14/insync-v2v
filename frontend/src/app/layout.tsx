import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

import { AssessmentProvider } from "@/context/AssessmentContext";
import "./globals.css";

// Three roles, not decoration: serif narrates, sans is the app's own voice,
// mono is reserved strictly for official rule ids/citations/clause
// references — never for user-facing metrics like a score or a date.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ShaktiScale AI",
  description:
    "A readiness copilot for women entrepreneurs — verified against real government scheme rules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <AssessmentProvider>{children}</AssessmentProvider>
      </body>
    </html>
  );
}
