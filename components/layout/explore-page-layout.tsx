import type { ReactNode } from "react";

import { MobileShell } from "@/components/mobile-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

interface ExplorePageLayoutProps {
  children: ReactNode;
  /** 스크롤 영역 위에 고정되는 헤더(카테고리 nav 등) */
  header?: ReactNode;
  scrollClassName?: string;
  className?: string;
}

/** 홈·탐색 등 explore 콘텐츠 + 하단 푸터 공통 레이아웃 */
export function ExplorePageLayout({
  children,
  header,
  scrollClassName,
  className,
}: ExplorePageLayoutProps) {
  return (
    <MobileShell>
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden bg-background",
          className,
        )}
      >
        {header}

        <div
          className={cn(
            "scroll-hide min-h-0 flex-1 overflow-y-auto",
            scrollClassName,
          )}
        >
          {children}
          <SiteFooter />
        </div>
      </div>
    </MobileShell>
  );
}
