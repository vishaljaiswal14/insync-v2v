// A visual placeholder only — not a real, scannable QR code, not a real
// URL. The grid pattern is deterministically derived from the verification
// id purely as a decorative motif (so it looks stable, not randomly
// regenerated on every render), and the label beneath is deliberately
// explicit that this is a local prototype, not a working verification link.
export default function QRPlaceholder({ seed }: { seed: string }) {
  const cells = buildPattern(seed);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-8 gap-0.5 rounded-sm border border-line bg-white p-2 print:[print-color-adjust:exact]" aria-hidden="true">
        {cells.map((filled, i) => (
          <span
            key={i}
            className={`h-2 w-2 ${
              filled ? "bg-ink print:bg-black print:[print-color-adjust:exact]" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-faint print:text-ink">Demo Verification</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-faint print:text-ink">
        Local Prototype — Not Scannable
      </p>
    </div>
  );
}

function buildPattern(seed: string): boolean[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const cells: boolean[] = [];
  for (let i = 0; i < 64; i++) {
    // Position-marker corners, like a real QR code's finder patterns —
    // purely visual, so the placeholder reads as "QR-shaped" at a glance.
    const row = Math.floor(i / 8);
    const col = i % 8;
    const inCorner =
      (row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3);
    cells.push(inCorner ? true : ((hash >> i % 32) & 1) === 1);
  }
  return cells;
}
