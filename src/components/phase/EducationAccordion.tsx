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
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {headline}
        </p>
        <span className="text-gray-400 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {body}
        </p>
      )}
    </div>
  )
}
