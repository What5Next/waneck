"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, NotebookText, UserRound } from "lucide-react";
import { toast } from "sonner";

import { PopoverMenuPanel } from "@/components/ui/popover-menu";
import { PersonaSettings } from "@/components/persona/persona-settings";
import { UserNotesSettings } from "@/components/user-notes/user-notes-settings";
import { SettingsTextareaField } from "@/components/default-settings/settings-textarea-field";
import {
  SettingsFormActions,
  SettingsSaveButton,
} from "@/components/default-settings/settings-save-button";
import { settingsIntroDescriptionClassName } from "@/components/default-settings/settings-field-classes";
import { cn } from "@/lib/utils";

type SettingsTab = "persona" | "memory" | "notes";

const MEMORY_CONTENT_MAX_LENGTH = 2000;

const SETTINGS_PANEL_HEADER_MIN_HEIGHT = "min-h-[3.25rem]";
const SETTINGS_PANEL_SCROLL_MAX_HEIGHT_POPOVER = "max-h-[min(58vh,360px)]";

const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "persona", label: "Persona", icon: <UserRound className="h-4 w-4" /> },
  { id: "memory", label: "Memory", icon: <BookOpen className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <NotebookText className="h-4 w-4" /> },
];

const SETTINGS_TAB_INTROS: Record<SettingsTab, { title: string; description: string }> = {
  persona: {
    title: "Persona",
    description: "Chat with the character based on your persona.",
  },
  memory: {
    title: "Memory",
    description: "Automatically summarized and updated at your interval.",
  },
  notes: {
    title: "Notes",
    description: "Write a user note so the character always remembers it.",
  },
};

function TabIntro({ tab }: { tab: SettingsTab }) {
  const { title, description } = SETTINGS_TAB_INTROS[tab];

  return (
    <div className="mb-5 space-y-0.5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className={settingsIntroDescriptionClassName}>{description}</p>
    </div>
  );
}

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

function MemoryTabContent() {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const trimmedContent = content.trim();
  const isSaveEnabled =
    trimmedContent.length > 0 && trimmedContent !== savedContent;

  function handleSave() {
    if (!isSaveEnabled) return;

    setSavedContent(trimmedContent);
    setContent(trimmedContent);
    toast.success("Memory saved.");
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
      <SettingsTextareaField
        value={content}
        onChange={setContent}
        maxLength={MEMORY_CONTENT_MAX_LENGTH}
        placeholder="Enter what you'd like the character to remember"
        aria-label="Memory content"
      />

      <SettingsFormActions>
        <SettingsSaveButton enabled={isSaveEnabled} onClick={handleSave} />
      </SettingsFormActions>
    </div>
  );
}

function ChatSettingsPanelBody({
  conversationId,
  className,
  presentation = "popover",
}: ChatSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("persona");

  const isSheet = presentation === "sheet";
  const scrollMaxHeightClass = SETTINGS_PANEL_SCROLL_MAX_HEIGHT_POPOVER;

  const panelContent = (
    <>
      {/* Top tabs — fixed height to prevent sheet jump */}
      <div className={cn("mb-3 shrink-0", SETTINGS_PANEL_HEADER_MIN_HEIGHT)}>
        <div className="flex h-full w-full gap-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-xs leading-none font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
                  {tab.icon}
                </span>
                <span className="w-full truncate text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "scroll-hide w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto pb-2",
          isSheet ? "min-h-0 flex-1" : scrollMaxHeightClass,
        )}
      >
        <TabIntro tab={activeTab} />
        {activeTab === "persona" ? (
          <PersonaSettings
            hideLabel
            scope="conversation"
            conversationId={conversationId}
          />
        ) : activeTab === "memory" ? (
          <MemoryTabContent />
        ) : (
          <UserNotesSettings
            hideLabel
            scope="conversation"
            conversationId={conversationId}
          />
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
