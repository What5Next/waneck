"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Pencil, Share2 } from "lucide-react";

import { CharacterGridCard } from "@/components/character-grid-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuTextOption,
  PopoverMenuTrigger,
} from "@/components/ui/popover-menu";
import { RowPanel } from "@/components/ui/list";
import { Row } from "@/components/ui/row";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import type { Character } from "@/lib/types";
import type { ProfileSummary, ProfileTab } from "@/lib/user-profile";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";

const PROFILE_TABS = [
  { value: "characters" as const, label: "캐릭터" },
  { value: "followers" as const, label: "팔로워" },
  { value: "following" as const, label: "팔로잉" },
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
  // P3: useEffect fetch 대신 TanStack Query (mypage·user-menu와 캐시 공유)
  const { data: profile, isPending: loading } = useProfileQuery();
  const [activeTab, setActiveTab] = useState<ProfileTab>("characters");
  const [characterSort, setCharacterSort] = useState<CharacterSortId>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

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
        <IconButton
          size="md"
          shape="square"
          onClick={() => router.back()}
          className="text-foreground"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
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
              <IconButton onClick={handleShare} aria-label="프로필 공유">
                <Share2 className="h-4 w-4" />
              </IconButton>
              <Button type="button" variant="pill" aria-label="프로필 수정">
                <Pencil className="h-3.5 w-3.5" />
                프로필 수정
              </Button>
            </div>
          </div>
        </div>

        {/* 최근 30일 won */}
        <RowPanel className="mx-5">
          <Row
            icon={
              <span className="text-base" aria-hidden>
                🔮
              </span>
            }
            label="최근 30일 받은 won"
            value={String(profile.wons_received_30d)}
          />
        </RowPanel>

        <UnderlineTabs
          value={activeTab}
          onValueChange={setActiveTab}
          options={PROFILE_TABS}
          className="mt-6 px-5"
        />

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

                <PopoverMenu open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
                  <PopoverMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    {
                      CHARACTER_SORT_OPTIONS.find(
                        (option) => option.id === characterSort,
                      )?.label
                    }
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        sortMenuOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </PopoverMenuTrigger>

                  <PopoverMenuContent
                    side="bottom"
                    align="end"
                    width="sm"
                    padded={false}
                  >
                    <div className="p-1.5">
                      {CHARACTER_SORT_OPTIONS.map((option) => (
                        <PopoverMenuTextOption
                          key={option.id}
                          selected={characterSort === option.id}
                          onClick={() => {
                            setCharacterSort(option.id);
                            setSortMenuOpen(false);
                          }}
                        >
                          {option.label}
                        </PopoverMenuTextOption>
                      ))}
                    </div>
                  </PopoverMenuContent>
                </PopoverMenu>
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
