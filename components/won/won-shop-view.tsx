"use client";

import { useState } from "react";
import { Gem, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import {
  WON_PACKAGES,
  WON_PAYMENT_METHODS,
  WON_PURCHASE_TABS,
  WON_REFUND_NOTICES,
  type WonPackage,
  type WonPaymentMethod,
  type WonPurchaseTab,
} from "@/lib/won-shop";
import { cn } from "@/lib/utils";

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString("en-US")}`;
}

export function WonShopView() {
  const { data: profile } = useProfileQuery()
  const [activeTab, setActiveTab] = useState<WonPurchaseTab>("purchase");
  const [selectedPackageId, setSelectedPackageId] = useState(
    WON_PACKAGES[1]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<WonPaymentMethod>("card");

  const selectedPackage =
    WON_PACKAGES.find((item) => item.id === selectedPackageId) ??
    WON_PACKAGES[0];

  function handleCheckout() {
    if (activeTab === "free") {
      toast.message("Free won rewards are coming soon.");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package.");
      return;
    }

    toast.message("Checkout is coming soon.");
  }

  return (
    <div className="scroll-hide flex h-full min-h-0 flex-col overflow-y-auto bg-background pb-8">
      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-muted/30 px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">My won</p>
          <div className="mt-1 flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {(profile?.token_balance ?? 0).toLocaleString("ko-KR")}
            </span>
            <span className="text-sm text-muted-foreground">won</span>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Bonus won on your first purchase
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Top up now for extra rewards
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <SegmentedControl
          value={activeTab}
          onValueChange={setActiveTab}
          options={WON_PURCHASE_TABS.map((tab) => ({
            value: tab.id,
            label: tab.label,
          }))}
          size="md"
          columns={2}
          className="w-full"
          aria-label="won purchase options"
        />
      </section>

      {activeTab === "purchase" ? (
        <>
          <section className="px-4 pt-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Packages
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {WON_PACKAGES.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  selected={selectedPackageId === item.id}
                  onSelect={() => setSelectedPackageId(item.id)}
                />
              ))}
            </div>
          </section>

          <section className="px-4 pt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Payment method
            </h2>
            <div className="space-y-2">
              {WON_PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-foreground"
                        : "bg-muted/30 text-foreground hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-medium">{method.label}</span>
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full border-2",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30",
                      )}
                      aria-hidden
                    />
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
                ? `Pay ${formatKrw(selectedPackage.priceKrw)}`
                : "Checkout"}
            </Button>
          </section>
        </>
      ) : (
        <section className="px-4 pt-5">
          <div className="rounded-2xl bg-muted/20 px-4 py-8 text-center">
            <EmptyState
              message={
                <>
                  <span className="block text-sm font-semibold text-foreground">
                    Get free won
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Check-in and mission rewards are coming soon.
                  </span>
                </>
              }
              icon={Gift}
              iconClassName="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 p-3 text-primary"
              messageClassName="max-w-none px-0"
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-4 rounded-xl"
              onClick={handleCheckout}
            >
              Claim free won
            </Button>
          </div>
        </section>
      )}

      <section className="px-4 pt-8">
        <h2 className="mb-2 text-xs font-semibold text-muted-foreground">
          Refund policy & won usage
        </h2>
        <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {WON_REFUND_NOTICES.map((notice) => (
            <li key={notice} className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PackageCard({
  item,
  selected,
  onSelect,
}: {
  item: WonPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const totalWon = item.wonAmount + (item.bonusWon ?? 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start rounded-2xl px-3.5 py-3.5 text-left transition-colors",
        selected
          ? "bg-primary/10 ring-2 ring-primary"
          : "bg-muted/30 hover:bg-muted/50",
      )}
    >
      {item.badge ? (
        <span className="mb-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {item.badge}
        </span>
      ) : null}

      <div className="flex items-center gap-1.5">
        <Gem className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-base font-bold tabular-nums text-foreground">
          {item.wonAmount.toLocaleString("en-US")}
        </span>
      </div>

      {item.bonusWon ? (
        <p className="mt-1 text-[11px] font-medium text-primary">
          +{item.bonusWon.toLocaleString("en-US")} bonus
        </p>
      ) : null}

      <p className="mt-2 text-sm font-semibold text-foreground">
        {formatKrw(item.priceKrw)}
      </p>

      {item.bonusWon ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {totalWon.toLocaleString("en-US")} won total
        </p>
      ) : null}
    </button>
  );
}
