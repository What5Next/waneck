import Link from "next/link";
import { Gem } from "lucide-react";

import { cn } from "@/lib/utils";

export function NexBalanceBar({
  balance,
  href,
  className,
}: {
  balance: number;
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl bg-muted/30 px-4 py-4",
        href ? "transition-colors hover:bg-muted/40" : "",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">My Nex</p>
      <div className="flex items-center gap-1.5">
        <Gem className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-base font-bold tabular-nums text-foreground">
          {balance.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
