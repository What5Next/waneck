"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Share2,
} from "lucide-react";

import { CharacterGridCard } from "@/components/character-grid-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import type { Character } from "@/lib/types";
import type { ProfileSummary, ProfileTab } from "@/lib/user-profile";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "characters", label: "캐릭터" },
  { id: "followers", label: "팔로워" },
  { id: "following", label: "팔로잉" },
];

const CHARACTER_SORT_OPTIONS = [
  { id: "newest", label: "최신순" },
  { id: "oldest", label: "오래된순" },
  { id: "name", label: "이름순" },
] as const;

type CharacterSortId = (typeof CHARACTER_SORT_OPTIONS)[number]["id"];

function sortProfileCharacters(
  characters: ProfileSummary["characters"],
  sortId: CharacterSortId,
) {
  const sorted = [...characters];

  if (sortId === "oldest") {
    return sorted.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  if (sortId === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }

  return sorted.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("characters");
  const [characterSort, setCharacterSort] = useState<CharacterSortId>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/");
          return null;
        }
        if (!response.ok) throw new Error("profile fetch failed");
        return response.json() as Promise<ProfileSummary>;
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const sortedCharacters = useMemo(() => {
    if (!profile) return [];
    return sortProfileCharacters(profile.characters, characterSort);
  }, [profile, characterSort]);

  async function handleShare() {
    if (!profile || typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/profile`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.display_name} | 와넥`,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // 공유 취소·권한 거부는 무시
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        <div className="h-14 shrink-0 border-b border-border" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* 상단 네비 */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-muted"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground">{profile.handle}</span>
      </div>

      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto">
        {/* 프로필 헤더 */}
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {getProfileInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pt-1">
              <h1 className="truncate text-xl font-bold text-foreground">
                {profile.display_name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <span>{profile.follower_count} 팔로워</span>
                <span className="mx-2 text-border">|</span>
                <span>{profile.following_count} 팔로잉</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="프로필 공유"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
                aria-label="프로필 수정"
              >
                <Pencil className="h-3.5 w-3.5" />
                프로필 수정
              </button>
            </div>
          </div>
        </div>

        {/* 최근 30일 오브 */}
        <button
          type="button"
          className="mx-5 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left hover:bg-muted/40"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base" aria-hidden>
              🔮
            </span>
            <span className="text-sm text-foreground">최근 30일 받은 won</span>
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {profile.wons_received_30d}
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>

        {/* 탭 */}
        <div className="mt-6 border-b border-border px-5">
          <div className="flex justify-center gap-8">
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative pb-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {activeTab === tab.id ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="px-5 py-4">
          {activeTab === "characters" ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {profile.public_character_count} 공개 캐릭터
                  <span className="mx-1.5">|</span>
                  {profile.chat_count} 대화
                </p>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortMenuOpen((open) => !open)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {
                      CHARACTER_SORT_OPTIONS.find(
                        (option) => option.id === characterSort,
                      )?.label
                    }
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {sortMenuOpen ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10"
                        aria-label="정렬 메뉴 닫기"
                        onClick={() => setSortMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
                        {CHARACTER_SORT_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setCharacterSort(option.id);
                              setSortMenuOpen(false);
                            }}
                            className={cn(
                              "block w-full px-3 py-2 text-left text-xs hover:bg-muted",
                              characterSort === option.id
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {sortedCharacters.length === 0 ? (
                <EmptyState
                  message="결과가 없습니다."
                  className="min-h-[200px] py-16"
                  messageClassName="text-sm"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 xs:grid-cols-3">
                  {sortedCharacters.map((character) => (
                    <CharacterGridCard
                      key={character.id}
                      character={character as Character}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              message={
                activeTab === "followers"
                  ? "아직 팔로워가 없습니다."
                  : "아직 팔로잉하는 사용자가 없습니다."
              }
              className="min-h-[200px] py-16"
              messageClassName="text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
