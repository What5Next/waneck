"use client";

import { useState } from "react";
import { Gem, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
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
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function WonShopView() {
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
      toast.message("무료 won 지급은 준비 중이에요.");
      return;
    }

    if (!selectedPackage) {
      toast.error("상품을 선택해주세요.");
      return;
    }

    toast.message("결제는 준비 중이에요.");
  }

  return (
    <div className="scroll-hide flex h-full min-h-0 flex-col overflow-y-auto bg-background pb-8">
      {/* 잔액 */}
      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-muted/30 px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">나의 won</p>
          <div className="mt-1 flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-2xl font-bold tabular-nums text-foreground">
              0
            </span>
            <span className="text-sm text-muted-foreground">개</span>
          </div>
        </div>
      </section>

      {/* 프로모 배너 */}
      <section className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              첫 결제 시 보너스 won 지급
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              지금 충전하면 추가 혜택을 받을 수 있어요
            </p>
          </div>
        </div>
      </section>

      {/* 탭 */}
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
          aria-label="won 충전 방식"
        />
      </section>

      {activeTab === "purchase" ? (
        <>
          {/* 상품 */}
          <section className="px-4 pt-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              상품 구성
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

          {/* 결제 수단 */}
          <section className="px-4 pt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              결제 수단
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

          {/* 결제 CTA */}
          <section className="px-4 pt-6">
            <Button
              type="button"
              className="h-11 w-full rounded-xl text-sm font-semibold"
              onClick={handleCheckout}
            >
              {selectedPackage
                ? `${formatKrw(selectedPackage.priceKrw)} 결제하기`
                : "결제하기"}
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
                    무료 won 받기
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    출석·미션 보상은 곧 제공될 예정이에요.
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
              무료로 받기
            </Button>
          </div>
        </section>
      )}

      {/* 환불 안내 */}
      <section className="px-4 pt-8">
        <h2 className="mb-2 text-xs font-semibold text-muted-foreground">
          환불 정책 및 won 이용 안내
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
          {item.wonAmount.toLocaleString("ko-KR")}
        </span>
      </div>

      {item.bonusWon ? (
        <p className="mt-1 text-[11px] font-medium text-primary">
          +{item.bonusWon.toLocaleString("ko-KR")} 보너스
        </p>
      ) : null}

      <p className="mt-2 text-sm font-semibold text-foreground">
        {formatKrw(item.priceKrw)}
      </p>

      {item.bonusWon ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          총 {totalWon.toLocaleString("ko-KR")} won
        </p>
      ) : null}
    </button>
  );
}
