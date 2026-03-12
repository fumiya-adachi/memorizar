"use client"

import { useActionState, useState } from "react"
import {
  deleteFlashCard,
  updateFlashCard,
  type FlashCardState,
} from "./actions"

type FlashCardItemProps = {
  deckId: number
  card: {
    id: number
    question: string
    answer: string
  }
}

const initialState: FlashCardState = {}

export default function FlashCardItem({
  deckId,
  card,
}: FlashCardItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const updateFlashCardWithIds = updateFlashCard.bind(null, deckId, card.id)
  const deleteFlashCardWithIds = deleteFlashCard.bind(null, deckId, card.id)

  const [state, formAction, isPending] = useActionState(
    updateFlashCardWithIds,
    initialState
  )

  return (
    <div className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1.2fr_140px] md:items-start">
      {isEditing ? (
        <>
          <form action={formAction} className="contents">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                Question
              </p>
              <input
                name="question"
                defaultValue={card.question}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 md:mt-0"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                Answer
              </p>
              <input
                name="answer"
                defaultValue={card.answer}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 md:mt-0"
              />
              {state.error ? (
                <p className="mt-2 text-sm text-red-600">{state.error}</p>
              ) : null}
            </div>

            <div className="flex gap-2 md:justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPending ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
              >
                キャンセル
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
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

          <div className="flex gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              編集
            </button>

            <form action={deleteFlashCardWithIds}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                削除
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}