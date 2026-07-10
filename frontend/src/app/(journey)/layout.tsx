import LedgerDrawer from "@/components/ledger/LedgerDrawer";
import ProgressHeader from "@/components/ProgressHeader";

// Everything from /assess onward shares this shell: progress rail, no
// marketing Footer, no nav bar. Deliberately different chrome from Landing,
// because this is a guided flow, not a page someone browses around in.
//
// LedgerDrawer is mounted once, here, rather than per-page — there is
// exactly one Decision Ledger instance for the whole journey, and every
// screen below opens the same one instead of mounting its own copy.
export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ProgressHeader />
      <main className="flex-1">{children}</main>
      <LedgerDrawer />
    </div>
  );
}
