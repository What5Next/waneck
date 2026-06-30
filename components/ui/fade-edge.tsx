"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

/** true면 size(px) 사용, number면 해당 px만큼 fade */
type FadeEdgeSide = boolean | number;

type FadeEdgeVariant = "overlay" | "mask";
type FadeEdgeColor = "background" | "card" | (string & {});

interface FadeEdgeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  top?: FadeEdgeSide;
  bottom?: FadeEdgeSide;
  left?: FadeEdgeSide;
  right?: FadeEdgeSide;
  /** side가 true일 때 적용되는 기본 fade 구간 (px) */
  size?: number;
  /**
   * overlay: 고정 UI(header/sidebar)용 그라데이션 오버레이
   * mask: 스크롤 컨테이너용 mask-image (Gemini 방식)
   */
  variant?: FadeEdgeVariant;
  /** overlay 그라데이션 시작 색 */
  fadeColor?: FadeEdgeColor;
}

function resolveFadeSize(
  side: FadeEdgeSide | undefined,
  defaultSize: number,
): number | null {
  if (!side) return null;
  return typeof side === "number" ? side : defaultSize;
}

function resolveFadeColor(color: FadeEdgeColor): string {
  if (color === "background") return "hsl(var(--background))";
  if (color === "card") return "hsl(var(--card))";
  return color;
}

function buildVerticalMask(
  topSize: number | null,
  bottomSize: number | null,
): string | null {
  if (topSize === null && bottomSize === null) return null;

  const stops: string[] = [];

  if (topSize !== null) {
    stops.push("transparent 0", `black ${topSize}px`);
  } else {
    stops.push("black 0");
  }

  if (bottomSize !== null) {
    stops.push(`black calc(100% - ${bottomSize}px)`, "transparent 100%");
  } else {
    stops.push("black 100%");
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

function buildHorizontalMask(
  leftSize: number | null,
  rightSize: number | null,
): string | null {
  if (leftSize === null && rightSize === null) return null;

  const stops: string[] = [];

  if (leftSize !== null) {
    stops.push("transparent 0", `black ${leftSize}px`);
  } else {
    stops.push("black 0");
  }

  if (rightSize !== null) {
    stops.push(`black calc(100% - ${rightSize}px)`, "transparent 100%");
  } else {
    stops.push("black 100%");
  }

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function buildMaskStyle({
  top,
  bottom,
  left,
  right,
}: {
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
}): CSSProperties | undefined {
  const verticalMask = buildVerticalMask(top, bottom);
  const horizontalMask = buildHorizontalMask(left, right);
  const layers = [verticalMask, horizontalMask].filter(Boolean) as string[];

  if (layers.length === 0) return undefined;

  if (layers.length === 1) {
    return {
      WebkitMaskImage: layers[0],
      maskImage: layers[0],
    };
  }

  return {
    WebkitMaskImage: layers.join(", "),
    maskImage: layers.join(", "),
    WebkitMaskComposite: "source-in",
    maskComposite: "intersect",
  };
}

function FadeEdgeOverlay({
  side,
  size,
  color,
}: {
  side: "top" | "bottom" | "left" | "right";
  size: number;
  color: string;
}) {
  const overlayBaseClass = "pointer-events-none absolute z-20";

  if (side === "top") {
    // composer처럼 아래 고정 UI 위로 걸쳐 위 콘텐츠와 블렌드
    return (
      <div
        aria-hidden
        className={cn(overlayBaseClass, "inset-x-0")}
        style={{
          bottom: "100%",
          height: size,
          background: `linear-gradient(to bottom, transparent, ${color})`,
        }}
      />
    );
  }

  if (side === "bottom") {
    // 헤더처럼 아래 콘텐츠 위에 걸치는 fade
    return (
      <div
        aria-hidden
        className={cn(overlayBaseClass, "inset-x-0")}
        style={{
          top: "99%",
          height: size,
          background: `linear-gradient(to bottom, ${color}, transparent)`,
        }}
      />
    );
  }

  if (side === "left") {
    return (
      <div
        aria-hidden
        className={cn(overlayBaseClass, "inset-y-0 left-0")}
        style={{
          width: size,
          background: `linear-gradient(to right, ${color}, transparent)`,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(overlayBaseClass, "inset-y-0 right-0")}
      style={{
        width: size,
        background: `linear-gradient(to left, ${color}, transparent)`,
      }}
    />
  );
}

export function FadeEdge({
  children,
  top,
  bottom,
  left,
  right,
  size = 40,
  variant = "overlay",
  fadeColor = "background",
  className,
  style,
  ...props
}: FadeEdgeProps) {
  const topSize = resolveFadeSize(top, size);
  const bottomSize = resolveFadeSize(bottom, size);
  const leftSize = resolveFadeSize(left, size);
  const rightSize = resolveFadeSize(right, size);
  const resolvedColor = resolveFadeColor(fadeColor);

  const maskStyle = useMemo(
    () =>
      variant === "mask"
        ? buildMaskStyle({
            top: topSize,
            bottom: bottomSize,
            left: leftSize,
            right: rightSize,
          })
        : undefined,
    [variant, topSize, bottomSize, leftSize, rightSize],
  );

  return (
    <div
      className={cn(variant === "overlay" && "relative", className)}
      style={{ ...maskStyle, ...style }}
      {...props}
    >
      {children}

      {variant === "overlay" ? (
        <>
          {topSize !== null ? (
            <FadeEdgeOverlay side="top" size={topSize} color={resolvedColor} />
          ) : null}
          {bottomSize !== null ? (
            <FadeEdgeOverlay
              side="bottom"
              size={bottomSize}
              color={resolvedColor}
            />
          ) : null}
          {leftSize !== null ? (
            <FadeEdgeOverlay
              side="left"
              size={leftSize}
              color={resolvedColor}
            />
          ) : null}
          {rightSize !== null ? (
            <FadeEdgeOverlay
              side="right"
              size={rightSize}
              color={resolvedColor}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
