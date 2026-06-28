"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTrigger,
  usePopoverMenu,
} from "@/components/ui/popover-menu";
import { findAiModelById, getModelShortName } from "@/lib/ai-models";
import { useAiModelsQuery } from "@/hooks/queries/use-ai-models-query";
import { cn } from "@/lib/utils";

/** ai_models.id (uuid) */
export type ModelId = string;

interface ModelSelectorProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
  compact?: boolean;
}

function ModelMenuItems({
  value,
  onChange,
}: {
  value: ModelId;
  onChange: (model: ModelId) => void;
}) {
  const { setOpen } = usePopoverMenu();
  const { data: models = [], isPending, isError } = useAiModelsQuery();

  if (isPending) {
    return (
      <div className="px-3 py-2 text-[13px] text-muted-foreground">
        모델 불러오는 중…
      </div>
    );
  }

  if (isError || models.length === 0) {
    return (
      <div className="px-3 py-2 text-[13px] text-muted-foreground">
        사용 가능한 모델이 없습니다
      </div>
    );
  }

  return (
    <>
      {models.map((model) => (
        <PopoverMenuItem
          key={model.id}
          label={model.display_name}
          description={model.description ?? undefined}
          selected={value === model.id}
          onClick={() => {
            onChange(model.id);
            setOpen(false);
          }}
        />
      ))}
    </>
  );
}

export function ModelSelector({
  value,
  onChange,
  compact = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: models = [] } = useAiModelsQuery();
  const current = findAiModelById(models, value);

  // 저장된 id가 목록에 없으면 첫 번째 활성 모델로 보정
  useEffect(() => {
    if (models.length === 0) return;
    if (models.some((model) => model.id === value)) return;
    onChange(models[0].id);
  }, [models, onChange, value]);

  const label = current
    ? compact
      ? getModelShortName(current.display_name)
      : current.display_name
    : compact
      ? "Model"
      : "Select model";

  return (
    <PopoverMenu open={open} onOpenChange={setOpen}>
      <PopoverMenuTrigger
        className={cn(
          "flex items-center gap-1 rounded-lg font-medium text-foreground transition-colors hover:bg-muted",
          compact ? "px-2 py-1 text-[12px]" : "px-2.5 py-1.5 text-[13px]",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "text-muted-foreground transition-transform",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </PopoverMenuTrigger>

      <PopoverMenuContent
        side={compact ? "top" : "bottom"}
        align={compact ? "start" : "end"}
        width="md"
        padded={false}
      >
        <div className="p-1.5">
          <ModelMenuItems value={value} onChange={onChange} />
        </div>
      </PopoverMenuContent>
    </PopoverMenu>
  );
}
