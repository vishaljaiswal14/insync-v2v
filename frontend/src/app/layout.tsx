import type { Metadata } from "next";

import { AssessmentProvider } from "@/context/AssessmentContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShaktiScale AI",
  description:
    "AI-powered growth assessment, scheme discovery, and roadmaps for women entrepreneurs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AssessmentProvider>{children}</AssessmentProvider>
      </body>
    </html>
  );
}
