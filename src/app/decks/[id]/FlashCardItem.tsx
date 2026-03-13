"use client"

import { useState } from "react"
import EditFlashCardModal from "./EditFlashCardModal"

type FlashCardItemProps = {
  deckId: number
  card: {
    id: number
    question: string
    answer: string
    description: string | null
  }
}

export default function FlashCardItem({
  deckId,
  card,
}: FlashCardItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="grid w-full cursor-pointer gap-4 px-5 py-4 text-left transition hover:bg-gray-50 md:grid-cols-[1.1fr_1.1fr_1.2fr] md:items-start"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
            Question
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900 md:mt-0">
            {card.question}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
            Answer
          </p>
          <p className="mt-1 text-sm text-gray-700 md:mt-0">
            {card.answer}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
            Description
          </p>
          <p className="mt-1 text-sm text-gray-600 md:mt-0">
            {card.description || "—"}
          </p>
        </div>
      </button>

      <EditFlashCardModal
        deckId={deckId}
        card={card}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </>
  )
}