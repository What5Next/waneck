"use client";

import { useState } from "react";
import { Gem } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { NexBalanceBar } from "@/components/nex/nex-balance-bar";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import {
  NEX_PACKAGES,
  NEX_PAYMENT_METHODS,
  NEX_REFUND_NOTICES,
  type NexPackage,
  type NexPaymentMethod,
} from "@/lib/nex-shop";
import { cn } from "@/lib/utils";

function formatUsd(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function NexShopView() {
  const { data: profile } = useProfileQuery()
  const [selectedPackageId, setSelectedPackageId] = useState(
    NEX_PACKAGES.find((item) => item.badge)?.id ?? NEX_PACKAGES[0]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<NexPaymentMethod>("card");

  const selectedPackage =
    NEX_PACKAGES.find((item) => item.id === selectedPackageId) ??
    NEX_PACKAGES[0];

  function handleCheckout() {
    if (!selectedPackage) {
      toast.error("Please select a package.");
      return;
    }

    toast.message("Checkout is coming soon.");
  }

  return (
    <div className="scroll-hide flex h-full min-h-0 flex-col overflow-y-auto bg-background pb-8">
      <div className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col">
        <section className="px-4 pt-5">
          <NexBalanceBar balance={profile?.token_balance ?? 0} />
        </section>

        <section className="px-4 pt-5">
          <h2 className="mb-3 text-[19px] font-bold text-foreground">
            Packages
          </h2>
          <div className="space-y-2.5">
            {NEX_PACKAGES.map((item) => (
              <PackageRow
                key={item.id}
                item={item}
                selected={selectedPackageId === item.id}
                onSelect={() => setSelectedPackageId(item.id)}
              />
            ))}
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="mb-3 text-[19px] font-bold text-foreground">
            Payment method
          </h2>
          <div className="space-y-2">
            {NEX_PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 text-left text-foreground transition-colors",
                    isSelected
                      ? "border-primary"
                      : "border-transparent hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border-2",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                    )}
                    aria-hidden
                  />
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-4 pt-6">
          <Button
            type="button"
            className="h-11 w-full rounded-xl text-sm font-semibold"
            onClick={handleCheckout}
          >
            {selectedPackage
              ? `Pay ${formatUsd(selectedPackage.priceUsd)}`
              : "Checkout"}
          </Button>
        </section>

        <section className="px-4 pt-8">
          <h2 className="mb-2 text-xs font-medium text-muted-foreground">
            Refund policy & Nex usage
          </h2>
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {NEX_REFUND_NOTICES.map((notice) => (
              <li key={notice} className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>{notice}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PackageRow({
  item,
  selected,
  onSelect,
}: {
  item: NexPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const totalNex = item.nexAmount + (item.bonusNex ?? 0);
  const bonusPercent = item.bonusNex
    ? Math.round((item.bonusNex / item.nexAmount) * 100)
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-white/10 hover:bg-white/5",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
          <Gem className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tabular-nums text-foreground">
              {totalNex.toLocaleString("en-US")}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Nex
            </span>
            {item.badge ? (
              <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            ) : null}
          </div>
          {bonusPercent ? (
            <p className="mt-0.5 text-xs">
              <span className="text-muted-foreground">
                {item.nexAmount.toLocaleString("en-US")} Nex
              </span>{" "}
              <span className="font-semibold text-primary">
                +{bonusPercent}% bonus
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <span
        className={cn(
          "shrink-0 rounded-lg px-4 py-2 text-sm font-bold tabular-nums",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {formatUsd(item.priceUsd)}
      </span>
    </button>
  );
}
