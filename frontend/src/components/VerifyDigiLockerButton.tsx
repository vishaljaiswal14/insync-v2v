"use client";

import { useState } from "react";

// A mocked verification step — never a real network call, never a real
// DigiLocker API. The delay exists purely so the state transition (self-
// declared → verifying → verified) is visible rather than instant, matching
// the honest "(Demo)" labeling used throughout this flow. Clicking it can
// only ever move a document forward to verified; there is no real service
// to check against, so there's nothing to un-verify.
const MOCK_VERIFY_DELAY_MS = 900;

export default function VerifyDigiLockerButton({
  verified,
  onVerify,
  compact = false,
}: {
  verified: boolean;
  onVerify: () => void;
  compact?: boolean;
}) {
  const [verifying, setVerifying] = useState(false);
  const textSize = compact ? "text-[11px]" : "text-xs";

  if (verified) {
    return (
      <p className={`${textSize} font-semibold text-success`}>✓ Verified via DigiLocker (Demo)</p>
    );
  }

  function handleClick() {
    setVerifying(true);
    setTimeout(() => {
      onVerify();
      setVerifying(false);
    }, MOCK_VERIFY_DELAY_MS);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={verifying}
      className={`${textSize} font-semibold text-brand hover:text-brand-dark hover:underline disabled:opacity-50 transition-colors print:hidden`}
    >
      {verifying ? "Connecting to DigiLocker (Demo)…" : "Verify via DigiLocker (Demo)"}
    </button>
  );
}
