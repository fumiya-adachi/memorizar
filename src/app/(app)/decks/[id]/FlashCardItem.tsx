"use client"

import { useEffect, useRef, useState } from "react"
import EditFlashCardModal from "./EditFlashCardModal"

type FlashCardItemProps = {
  deckId: number
  canEdit?: boolean
  canDelete?: boolean
  helperText?: string
  card: {
    id: number
    question: string
    answer: string
    description: string | null
  }
}

export default function FlashCardItem({
  deckId,
  canEdit = true,
  canDelete = true,
  helperText,
  card,
}: FlashCardItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const handleSaved = () => {
    setShowToast(true)

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    toastTimerRef.current = window.setTimeout(() => {
      setShowToast(false)
    }, 2200)
  }

  if (!canEdit) {
    return (
      <>
        <div className="grid w-full gap-4 px-5 py-4 text-left md:grid-cols-[1.1fr_1.1fr_1.2fr] md:items-start">
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
        </div>

        {showToast ? (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
            カードを保存しました
          </div>
        ) : null}
      </>
    )
  }

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
        canDelete={canDelete}
        helperText={helperText}
        onSaved={handleSaved}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />

      {showToast ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          カードを保存しました
        </div>
      ) : null}
    </>
  )
}