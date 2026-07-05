"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Cpu,
  Download,
  FlaskConical,
  Gem,
  History,
  Info,
  Moon,
  NotebookText,
  Palette,
  Pencil,
  SlidersHorizontal,
  Sun,
  UserRound,
} from "lucide-react";
import { useThemeReady } from "@/hooks/use-theme-ready";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import {
  PopoverMenuGroup,
  PopoverMenuItem,
  PopoverMenuPanel,
} from "@/components/ui/popover-menu";
import { ChatRoomSettingsView } from "@/components/chat/chat-room-settings-view";
import { ChatAdvancedSettingsView } from "@/components/chat/chat-advanced-settings-view";
import { PersonaSettings } from "@/components/persona/persona-settings";
import { PromptSettings } from "@/components/prompt/prompt-settings";
import { UserNotesSettings } from "@/components/user-notes/user-notes-settings";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { useChatRoomName } from "@/hooks/use-user-settings";
import { cn } from "@/lib/utils";

type SettingsTab = "memory" | "persona" | "notes" | "output" | "settings";

type SettingsSubview = "menu" | "chat-room" | "advanced";

type MemoryTurn = {
  id: string;
  turnNumber: number;
  content: string;
};

// Mock memory data for UI preview before API integration
const MOCK_MEMORY_TURNS: MemoryTurn[] = [
  {
    id: "turn-1",
    turnNumber: 1,
    content:
      'The simulation engine is hungry for data. Arca and Space told Jinchoi, "We need the name of the world you want to enter. Without a specific title, the walls of this world cannot be built," and pointed out that the meaningless burst of sound ("asdasd") Jinchoi muttered was a broken key that could not construct a world. The space is now filled with inkless blank darkness.',
  },
];

// Mock output settings for UI preview before API integration
const MOCK_OUTPUT_MODEL = {
  name: "2.5 Pro",
  description:
    "A model with strong situational understanding that preserves character tone.",
  cost: 60,
};

type BillingPlan = "fixed" | "usage";

const SETTINGS_PANEL_HEADER_MIN_HEIGHT = "min-h-[3.25rem]";
const SETTINGS_PANEL_SCROLL_MAX_HEIGHT_POPOVER = "max-h-[min(58vh,360px)]";

const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "memory", label: "Memory", icon: <BookOpen className="h-3 w-3" /> },
  { id: "persona", label: "Persona", icon: <UserRound className="h-3 w-3" /> },
  { id: "notes", label: "Notes", icon: <NotebookText className="h-3 w-3" /> },
  { id: "output", label: "Output", icon: <Cpu className="h-3 w-3" /> },
  {
    id: "settings",
    label: "Settings",
    icon: <SlidersHorizontal className="h-3 w-3" />,
  },
];

type ChatSettingsPanelPresentation = "popover" | "sheet";

type ChatSettingsPanelProps = {
  characterId: string;
  characterName: string;
  conversationId?: string | null;
  onClose: () => void;
  className?: string;
  /** popover: header dropdown, sheet: mobile bottom sheet */
  presentation?: ChatSettingsPanelPresentation;
};

function SettingsMenuRow({
  icon,
  label,
  showChevron = true,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  showChevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <PopoverMenuItem
      icon={icon}
      label={label}
      showChevron={showChevron}
      onClick={onClick}
    />
  );
}

function PlaceholderTab() {
  return (
    <div className="rounded-xl bg-muted/15 py-8 text-center">
      <p className="text-[13px] text-muted-foreground">
        This feature is coming soon.
      </p>
    </div>
  );
}

const SETTINGS_DRILL_DOWN_TITLES: Record<
  Exclude<SettingsSubview, "menu">,
  string
> = {
  "chat-room": "Chat room settings",
  advanced: "Advanced",
};

function SettingsDrillDownHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className={cn("flex items-center", SETTINGS_PANEL_HEADER_MIN_HEIGHT)}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {title}
      </button>
    </div>
  );
}

function MemoryTurnCard({
  turn,
  canMoveUp,
  canMoveDown,
  onUpdateContent,
  onMoveUp,
  onMoveDown,
}: {
  turn: MemoryTurn;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdateContent: (content: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(turn.content);

  function handleStartEdit() {
    setDraftContent(turn.content);
    setIsEditing(true);
  }

  function handleSaveContent() {
    const trimmedContent = draftContent.trim();
    if (!trimmedContent) {
      toast.error("Please enter memory content.");
      return;
    }

    onUpdateContent(trimmedContent);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setDraftContent(turn.content);
    setIsEditing(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(turn.content);
      toast.success("Memory copied.");
    } catch {
      toast.error("Failed to copy.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          TURN {turn.turnNumber}
        </span>
        <IconButton
          size="xs"
          shape="square"
          aria-label={`Edit TURN ${turn.turnNumber}`}
          onClick={handleStartEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      {isEditing ? (
        <textarea
          autoFocus
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          onBlur={handleSaveContent}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSaveContent();
            }
            if (event.key === "Escape") handleCancelEdit();
          }}
          rows={6}
          className="w-full resize-none rounded-xl bg-muted/20 px-3 py-2.5 text-[13px] leading-relaxed text-foreground outline-none ring-1 ring-border focus:ring-primary"
          aria-label={`Edit TURN ${turn.turnNumber} content`}
        />
      ) : (
        <p className="wrap-break-word text-[13px] leading-relaxed text-muted-foreground">
          {turn.content}
        </p>
      )}

      <div className="flex justify-end gap-0.5">
        <IconButton
          size="xs"
          shape="square"
          aria-label="Copy memory"
          onClick={handleCopy}
        >
          <Copy className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          size="xs"
          shape="square"
          aria-label="Move up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          size="xs"
          shape="square"
          aria-label="Move down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    </div>
  );
}

function MemoryTabContent() {
  const [turns, setTurns] = useState<MemoryTurn[]>(() =>
    MOCK_MEMORY_TURNS.map((turn) => ({ ...turn })),
  );

  function updateTurnContent(turnId: string, content: string) {
    setTurns((prevTurns) =>
      prevTurns.map((turn) =>
        turn.id === turnId ? { ...turn, content } : turn,
      ),
    );
  }

  function moveTurn(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= turns.length) return;

    setTurns((prevTurns) => {
      const nextTurns = [...prevTurns];
      const [movedTurn] = nextTurns.splice(index, 1);
      nextTurns.splice(targetIndex, 0, movedTurn);

      // Reassign turnNumber after reordering
      return nextTurns.map((turn, turnIndex) => ({
        ...turn,
        turnNumber: turnIndex + 1,
      }));
    });
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {turns.map((turn, index) => (
        <MemoryTurnCard
          key={turn.id}
          turn={turn}
          canMoveUp={index > 0}
          canMoveDown={index < turns.length - 1}
          onUpdateContent={(content) => updateTurnContent(turn.id, content)}
          onMoveUp={() => moveTurn(index, "up")}
          onMoveDown={() => moveTurn(index, "down")}
        />
      ))}
    </div>
  );
}

function OutputSectionLabel({
  children,
  trailing,
}: {
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <p className="text-[11px] text-muted-foreground">{children}</p>
      {trailing}
    </div>
  );
}

function OutputLinkCard({
  title,
  description,
  badge,
  trailing,
  onClick,
}: {
  title: ReactNode;
  description?: string;
  badge?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl bg-muted/25 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {badge}
          <span className="truncate text-[13px] font-medium text-foreground">
            {title}
          </span>
        </div>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {trailing}
        <ChevronRight
          className="h-3.5 w-3.5 text-muted-foreground/40"
          aria-hidden
        />
      </div>
    </button>
  );
}

function OutputToggleRow({
  title,
  description,
  icon,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {icon ? (
            <span className="shrink-0 text-muted-foreground">{icon}</span>
          ) : null}
          <p className="text-[13px] font-medium text-foreground">{title}</p>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}

function OutputTabContent({
  conversationId,
}: {
  conversationId?: string | null;
}) {
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("fixed");
  const [antiImpersonateEnabled, setAntiImpersonateEnabled] = useState(false);
  const [awkwardOutputCorrectionEnabled, setAwkwardOutputCorrectionEnabled] =
    useState(false);

  // Prompt 2depth: editor 진입 시 아래 섹션은 secondarySections로 숨김
  return (
    <PromptSettings
      scope="conversation"
      conversationId={conversationId}
      secondarySections={
        <>
          <div className="space-y-2">
            <OutputSectionLabel>
              Chat Model &amp; Output Settings
            </OutputSectionLabel>
            <OutputLinkCard
              badge={
                <span className="rounded bg-primary px-1 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                  Pro
                </span>
              }
              title={MOCK_OUTPUT_MODEL.name}
              description={MOCK_OUTPUT_MODEL.description}
              trailing={
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
                  <Gem className="h-3 w-3 text-primary" aria-hidden />
                  {MOCK_OUTPUT_MODEL.cost}
                </span>
              }
              onClick={() => toast.message("Model settings are coming soon.")}
            />
          </div>

          <div className="space-y-2">
            <OutputSectionLabel
              trailing={
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Billing information"
                  onClick={() => toast.message("Billing info is coming soon.")}
                >
                  <Info className="h-3 w-3" />
                </button>
              }
            >
              Billing
            </OutputSectionLabel>
            <SegmentedControl
              value={billingPlan}
              onValueChange={setBillingPlan}
              layout="equal"
              columns={2}
              shape="rounded"
              size="md"
              className="w-full"
              aria-label="Billing plan"
              options={[
                { value: "fixed", label: "Fixed plan" },
                { value: "usage", label: "Usage-based" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <OutputSectionLabel>Response Settings</OutputSectionLabel>
            <div className="space-y-3 rounded-xl bg-muted/25 p-3">
              <OutputToggleRow
                title="Anti Impersonate"
                description="Prevents the model from generating responses on the user's behalf."
                checked={antiImpersonateEnabled}
                onCheckedChange={setAntiImpersonateEnabled}
              />
              <div className="border-t border-border" aria-hidden />
              <OutputToggleRow
                title="Awkward output correction"
                description="Smooths out unnatural Korean from certain models."
                icon={<FlaskConical className="h-3.5 w-3.5" />}
                checked={awkwardOutputCorrectionEnabled}
                onCheckedChange={setAwkwardOutputCorrectionEnabled}
              />
            </div>
          </div>
        </>
      }
    />
  );
}

function ChatSettingsPanelBody({
  characterId,
  characterName,
  conversationId,
  onClose,
  className,
  presentation = "popover",
}: ChatSettingsPanelProps) {
  const { isReady: isThemeReady, isDark, toggleTheme } = useThemeReady();
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");
  const [settingsSubview, setSettingsSubview] =
    useState<SettingsSubview>("menu");
  const [isEditingName, setIsEditingName] = useState(false);
  // Used only while editing — reset from roomName on enter/cancel
  const [draftName, setDraftName] = useState("");

  const { value: roomName, setValue: setRoomName } = useChatRoomName(
    characterId,
    characterName,
    conversationId,
  );

  const isSettingsDrillDownOpen =
    activeTab === "settings" && settingsSubview !== "menu";

  function handleStartEdit() {
    setDraftName(roomName);
    setIsEditingName(true);
  }

  function handleSaveRoomName(nextName: string) {
    const trimmedName = nextName.trim();
    if (!trimmedName) {
      toast.error("Please enter a chat room name.");
      return;
    }

    setRoomName(trimmedName);
    setIsEditingName(false);
  }

  function handleCancelEdit() {
    setDraftName(roomName);
    setIsEditingName(false);
  }

  function handleThemeToggle() {
    toggleTheme();
  }

  function handleExport() {
    toast.message("Export chat is coming soon.");
    onClose();
  }

  const isSheet = presentation === "sheet";
  const scrollMaxHeightClass = SETTINGS_PANEL_SCROLL_MAX_HEIGHT_POPOVER;

  const panelContent = (
    <>
      {/* Top tabs / drill-down header — fixed height to prevent sheet jump */}
      <div className={cn("mb-3 shrink-0", SETTINGS_PANEL_HEADER_MIN_HEIGHT)}>
        {isSettingsDrillDownOpen ? (
          <SettingsDrillDownHeader
            title={SETTINGS_DRILL_DOWN_TITLES[settingsSubview]}
            onBack={() => setSettingsSubview("menu")}
          />
        ) : (
          <div className="flex h-full w-full gap-1">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== "settings") {
                      setSettingsSubview("menu");
                    }
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] leading-none font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5">
                    {tab.icon}
                  </span>
                  <span className="w-full truncate text-center">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={cn(
          "scroll-hide w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto pb-2",
          isSheet ? "min-h-0 flex-1" : scrollMaxHeightClass,
        )}
      >
        {settingsSubview === "chat-room" ? (
          <ChatRoomSettingsView />
        ) : settingsSubview === "advanced" ? (
          <ChatAdvancedSettingsView />
        ) : activeTab === "settings" ? (
          <div className="space-y-3">
            {/* Chat room name */}
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Chat room name
              </p>
              <div className="flex items-center gap-2">
                <div className="flex h-10 min-w-0 flex-1 items-center rounded-xl bg-muted/25 px-3">
                  {isEditingName ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onBlur={() => handleSaveRoomName(draftName)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter")
                          handleSaveRoomName(draftName);
                        if (event.key === "Escape") handleCancelEdit();
                      }}
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                      aria-label="Edit chat room name"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {roomName}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    aria-label="Edit chat room name"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/25 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {isThemeReady ? (
                    isDark ? (
                      <Moon className="h-3.5 w-3.5" />
                    ) : (
                      <Sun className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Settings menu */}
            <PopoverMenuGroup>
              <SettingsMenuRow
                icon={<History className="h-3.5 w-3.5" />}
                label="Chat list"
                onClick={() => toast.message("Chat list is coming soon.")}
              />
              <SettingsMenuRow
                icon={<Palette className="h-3.5 w-3.5" />}
                label="Chat room settings"
                onClick={() => setSettingsSubview("chat-room")}
              />
              <SettingsMenuRow
                icon={<FlaskConical className="h-3.5 w-3.5" />}
                label="Advanced"
                onClick={() => setSettingsSubview("advanced")}
              />
              <SettingsMenuRow
                icon={<Download className="h-3.5 w-3.5" />}
                label="Export chat"
                showChevron={false}
                onClick={handleExport}
              />
            </PopoverMenuGroup>
          </div>
        ) : activeTab === "memory" ? (
          <MemoryTabContent />
        ) : activeTab === "persona" ? (
          <PersonaSettings
            scope="conversation"
            conversationId={conversationId}
          />
        ) : activeTab === "notes" ? (
          <UserNotesSettings
            scope="conversation"
            conversationId={conversationId}
          />
        ) : activeTab === "output" ? (
          <OutputTabContent conversationId={conversationId} />
        ) : (
          <PlaceholderTab />
        )}
      </div>
    </>
  );

  if (isSheet) {
    return (
      <div
        data-chat-settings-panel
        className={cn("flex h-full min-h-0 w-full flex-col", className)}
      >
        {panelContent}
      </div>
    );
  }

  return (
    <PopoverMenuPanel
      side="bottom"
      align="end"
      width="xl"
      className={className}
    >
      {panelContent}
    </PopoverMenuPanel>
  );
}

export function ChatSettingsPanel(props: ChatSettingsPanelProps) {
  return <ChatSettingsPanelBody {...props} />;
}
