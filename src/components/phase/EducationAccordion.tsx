'use client'

import { useState } from 'react'

interface Props {
  headline: string
  body: string
  cardClass: string
}

export default function EducationAccordion({ headline, body, cardClass }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`phase-card ${cardClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left min-h-[28px]"
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#5C5754] dark:text-[#A8A4A0]">
          {headline}
        </p>
        <span
          className="text-[#A8A4A0] text-xs ml-2 transition-transform duration-200 leading-none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {body}
        </p>
      )}
    </div>
  )
}
