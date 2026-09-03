"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { CharacterDetailLink } from "@/components/characters/character-detail-link";
import { IconButton } from "@/components/ui/icon-button";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeaturedCharacterSlideProps {
  character: Character;
  className?: string;
  pageLabel?: string;
  isActive: boolean;
}

function FeaturedCharacterSlide({ character, className, pageLabel, isActive }: FeaturedCharacterSlideProps) {
  return (
    <CharacterDetailLink
      characterId={character.id}
      className={cn("block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl", className)}
    >
      <div
        className="relative h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: character.profile_image_url
            ? `url(${character.profile_image_url})`
            : undefined,
          backgroundColor: "#1a1a2e",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {pageLabel ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {pageLabel}
          </span>
        ) : null}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 transition-opacity duration-300",
            isActive ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <h2 className="line-clamp-1 text-lg font-bold leading-snug text-white">
            {character.name}
          </h2>
          <p className="line-clamp-2 text-[12px] text-white/70">
            {character.short_intro}
          </p>
          <button
            type="button"
            className="mt-1.5 flex w-fit items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm hover:bg-white/25"
          >
            <Play className="size-3 fill-white" aria-hidden />
            Start chat
          </button>
        </div>
      </div>
    </CharacterDetailLink>
  );
}

interface FeaturedCharacterHeroProps {
  /** 캐로셀에 띄울 캐릭터 목록 — 가운데 카드가 크게, 양옆 카드는 살짝 잘려 보이는 무한루프 피크 캐로셀 */
  characters: Character[];
}

export function FeaturedCharacterHero({ characters }: FeaturedCharacterHeroProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = characters.length;
  const [activeIndex, setActiveIndex] = useState(0);

  // 루프 연출: 맨 앞에 마지막 캐릭터, 맨 뒤에 첫 캐릭터를 복제해 붙인다
  const loopedCharacters =
    total > 1 ? [characters[total - 1], ...characters, characters[0]] : characters;

  // 실제 레이아웃(패딩 포함)을 기준으로 특정 슬라이드를 스크롤 뷰 가운데로 오게 하는 목표 위치 계산
  function centerOffsetFor(index: number) {
    const el = scrollerRef.current;
    const child = el?.children[index] as HTMLElement | undefined;
    if (!el || !child) return null;
    return child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
  }

  function centerOnIndex(index: number, behavior: ScrollBehavior) {
    const el = scrollerRef.current;
    const target = centerOffsetFor(index);
    if (!el || target === null) return;
    el.scrollTo({ left: target, behavior });
  }

  // 현재 스크롤 위치와 가장 가까운(가운데에 근접한) 슬라이드의 extended index를 찾는다
  function findNearestExtendedIndex() {
    const el = scrollerRef.current;
    if (!el) return 0;
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    Array.from(el.children).forEach((child, index) => {
      const c = child as HTMLElement;
      const childCenter = c.offsetLeft + c.clientWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });
    return nearest;
  }

  useEffect(() => {
    if (total > 1) {
      const id = requestAnimationFrame(() => centerOnIndex(1, "instant"));
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || total <= 1) return;

    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      const nearest = findNearestExtendedIndex();

      if (nearest <= 0) {
        centerOnIndex(total, "instant");
        setActiveIndex(total - 1);
      } else if (nearest >= total + 1) {
        centerOnIndex(1, "instant");
        setActiveIndex(0);
      } else {
        setActiveIndex(nearest - 1);
      }
    }, 120);
  }

  function goTo(direction: 1 | -1) {
    const nearest = findNearestExtendedIndex();
    centerOnIndex(nearest + direction, "smooth");
  }

  if (total === 0) return null;

  if (total === 1) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <FeaturedCharacterSlide character={characters[0]} isActive />
      </div>
    );
  }

  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="scroll-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[16%]"
      >
        {loopedCharacters.map((character, index) => (
          <FeaturedCharacterSlide
            key={`${character.id}-${index}`}
            character={character}
            className="w-[68%] shrink-0 snap-center"
            isActive={index - 1 === activeIndex}
            pageLabel={index - 1 === activeIndex ? `${activeIndex + 1}/${total}` : undefined}
          />
        ))}
      </div>

      <IconButton
        variant="floating"
        size="sm"
        onClick={() => goTo(-1)}
        className="absolute left-6 top-1/2 z-10 -translate-y-1/2 sm:left-8 lg:left-10"
        aria-label="Previous"
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        variant="floating"
        size="sm"
        onClick={() => goTo(1)}
        className="absolute right-6 top-1/2 z-10 -translate-y-1/2 sm:right-8 lg:right-10"
        aria-label="Next"
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
}
