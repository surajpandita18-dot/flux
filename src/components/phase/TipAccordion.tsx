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
    <div className={`phase-card ${cardClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <span className="text-gray-400 text-xs ml-2 transition-transform duration-200" style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {open && (
        <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {content}
        </p>
      )}
    </div>
  )
}
