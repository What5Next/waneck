"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gem } from "lucide-react";
import { toast } from "sonner";

import { NexBalanceBar } from "@/components/nex/nex-balance-bar";
import {
  useCapturePayPalOrderMutation,
  useCreatePayPalOrderMutation,
} from "@/hooks/mutations/use-paypal-checkout";
import { usePayPalConfigQuery } from "@/hooks/queries/use-paypal-config-query";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import {
  NEX_PACKAGES,
  NEX_REFUND_NOTICES,
  type NexPackage,
} from "@/lib/nex-shop";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, string | number | boolean>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID?: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (error: unknown) => void;
      }) => {
        render: (selector: string | HTMLElement) => Promise<void>;
        close?: () => void;
      };
    };
  }
}

function formatUsd(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function NexShopView() {
  const { data: profile } = useProfileQuery()
  const { data: paypalConfig, isLoading: isPayPalConfigLoading } =
    usePayPalConfigQuery();
  const createOrderMutation = useCreatePayPalOrderMutation();
  const captureOrderMutation = useCapturePayPalOrderMutation();
  const createOrderAsync = createOrderMutation.mutateAsync;
  const captureOrderAsync = captureOrderMutation.mutateAsync;
  const paypalButtonsRef = useRef<HTMLDivElement | null>(null);
  const renderedButtonsRef = useRef<{ close?: () => void } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState(
    NEX_PACKAGES.find((item) => item.badge)?.id ?? NEX_PACKAGES[0]?.id ?? "",
  );

  const selectedPackage =
    NEX_PACKAGES.find((item) => item.id === selectedPackageId) ??
    NEX_PACKAGES[0];

  const createPayPalOrder = useCallback(async () => {
    if (!selectedPackage) {
      toast.error("Please select a package.");
      throw new Error("Package is required");
    }

    const result = await createOrderAsync({
      packageId: selectedPackage.id,
    });

    return result.orderId;
  }, [createOrderAsync, selectedPackage]);

  const captureApprovedPayPalOrder = useCallback(
    async (orderId: string) => {
      await captureOrderAsync(orderId);
    },
    [captureOrderAsync],
  );

  useEffect(() => {
    if (!paypalConfig?.enabled || !paypalConfig.clientId) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paypal-sdk="true"]',
    );

    if (window.paypal) {
      queueMicrotask(() => setSdkReady(true));
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", () => setSdkReady(true), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => setSdkError("PayPal could not be loaded."),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      paypalConfig.clientId,
    )}&currency=${encodeURIComponent(paypalConfig.currency)}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError("PayPal could not be loaded.");
    document.body.appendChild(script);
  }, [paypalConfig]);

  useEffect(() => {
    if (
      !sdkReady ||
      !window.paypal ||
      !paypalButtonsRef.current ||
      !selectedPackage ||
      !paypalConfig?.enabled
    ) {
      return;
    }

    paypalButtonsRef.current.innerHTML = "";
    renderedButtonsRef.current?.close?.();

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        shape: "rect",
        label: "paypal",
      },
      createOrder: createPayPalOrder,
      onApprove: async (data) => {
        if (!data.orderID) {
          toast.error("PayPal order was not approved.");
          return;
        }

        await captureApprovedPayPalOrder(data.orderID);
      },
      onCancel: () => {
        toast.message("Payment was cancelled.");
      },
      onError: (error) => {
        console.error("[PayPal Buttons]", error);
        toast.error("PayPal checkout failed.");
      },
    });

    renderedButtonsRef.current = buttons;
    void buttons.render(paypalButtonsRef.current);

    return () => {
      buttons.close?.();
    };
  }, [
    captureApprovedPayPalOrder,
    createPayPalOrder,
    paypalConfig?.enabled,
    sdkReady,
    selectedPackage,
  ]);

  const isCheckoutBusy = captureOrderMutation.isPending;
  const isPayPalUnavailable =
    !isPayPalConfigLoading && (!paypalConfig?.enabled || Boolean(sdkError));

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
            Payment
          </h2>
          <div className="min-h-[120px]">
            {isPayPalConfigLoading ? (
              <div className="flex h-[52px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                Loading PayPal...
              </div>
            ) : isPayPalUnavailable ? (
              <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                PayPal checkout is not configured.
              </div>
            ) : isCheckoutBusy ? (
              <div className="flex h-[52px] items-center justify-center rounded-lg bg-muted text-sm font-medium text-foreground">
                Processing payment...
              </div>
            ) : (
              <div ref={paypalButtonsRef} />
            )}
          </div>
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
