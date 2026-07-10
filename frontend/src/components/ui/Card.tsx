import type { HTMLAttributes } from "react";

// The one card shape used everywhere: white on the warm paper background,
// a hairline border, and a shadow tinted with ink rather than neutral
// black — restrained enough to disappear until you look for it.
export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white p-6 shadow-card ${className}`}
      {...props}
    />
  );
}
