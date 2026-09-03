"use client";

import { WandSparkles } from "lucide-react";

export type SuggestedReply = {
  narration?: string;
  dialogue: string;
};

type SuggestedRepliesProps = {
  items: SuggestedReply[];
  onSelect: (item: SuggestedReply) => void;
};

export function SuggestedReplies({ items, onSelect }: SuggestedRepliesProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex w-full flex-col items-end gap-2">
      <div className="mr-1 flex items-center gap-1.5 text-sm font-semibold text-white">
        <WandSparkles className="h-4 w-4" aria-hidden />
        Suggested Response
      </div>
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(item)}
          className="w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary/20 px-4 py-2.5 text-left shadow-sm transition-colors hover:bg-primary/30"
        >
          {item.narration ? (
            <p className="text-sm text-white/70">{item.narration}</p>
          ) : null}
          <p className="text-[15px] font-medium text-white">{item.dialogue}</p>
        </button>
      ))}
    </div>
  );
}
