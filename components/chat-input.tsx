'use client'

import { useState, useRef } from 'react'

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 110) + 'px'
    }
  }

  return (
    <div className="px-5 py-3 border-t border-white/[.07] bg-[#1a1916] flex gap-2.5 items-end flex-shrink-0">
      <div className="flex-1 flex items-end gap-2 bg-[#222019] border border-white/[.13] rounded-xl px-4 py-2.5 focus-within:border-[#c9a96e] transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          rows={1}
          className="flex-1 bg-transparent outline-none text-[#e8e4dc] placeholder-[#5a5650] text-sm resize-none min-h-5 max-h-28 leading-relaxed"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-9 h-9 rounded-lg bg-[#c9a96e] flex items-center justify-center text-[#1a1510] hover:bg-[#e8c98a] transition-all disabled:opacity-35 disabled:cursor-not-allowed hover:scale-105 flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  )
}
