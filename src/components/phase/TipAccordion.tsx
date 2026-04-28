'use client'

import { useState } from 'react'

interface Props {
  label: string
  content: string
  cardClass: string
  defaultOpen?: boolean
}

export default function TipAccordion({ label, content, cardClass, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`${cardClass} rounded-3xl px-5 py-4`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left min-h-[28px]"
        aria-expanded={open}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
          {label}
        </span>
        <span
          className="text-gray-400 text-xs ml-2 transition-transform duration-200 leading-none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <p className="mt-3 text-gray-700 dark:text-gray-200 text-[14px] leading-[1.65]">
          {content}
        </p>
      )}
    </div>
  )
}
