import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export default function TryDemoButton() {
  return (
    <Link
      href="/assess?demo=1"
      className={buttonVariants("secondary")}
    >
      Try Demo — see live verification
    </Link>
  );
}
