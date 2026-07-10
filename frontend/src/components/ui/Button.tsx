import type { ButtonHTMLAttributes } from "react";

// Two variants only, by design: primary (gold) is reserved for the single
// most important action on a screen; secondary (navy outline) is
// everything else. Exported as a class string too, so a `next/link`
// styled as a button uses the exact same rule instead of a copy.
const VARIANTS = {
  primary: "bg-accent text-ink hover:bg-accent/90",
  secondary: "border border-brand/30 text-brand bg-white hover:bg-brand/5",
} as const;

export function buttonVariants(variant: keyof typeof VARIANTS = "primary"): string {
  return `inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition disabled:opacity-50 ${VARIANTS[variant]}`;
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: keyof typeof VARIANTS } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${buttonVariants(variant)} ${className}`} {...props} />;
}
