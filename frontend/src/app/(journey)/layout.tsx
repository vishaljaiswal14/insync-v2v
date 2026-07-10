import ProgressHeader from "@/components/ProgressHeader";

// Everything from /assess onward shares this shell: progress rail, no
// marketing Footer, no nav bar. Deliberately different chrome from Landing,
// because this is a guided flow, not a page someone browses around in.
export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ProgressHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
