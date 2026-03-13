"use client"

import { useActionState } from "react"
import {
  deleteFlashCard,
  updateFlashCard,
  type FlashCardState,
} from "./actions"

type EditFlashCardModalProps = {
  deckId: number
  card: {
    id: number
    question: string
    answer: string
    description: string | null
  }
  isOpen: boolean
  onClose: () => void
}

const initialState: FlashCardState = {}

export default function EditFlashCardModal({
  deckId,
  card,
  isOpen,
  onClose,
}: EditFlashCardModalProps) {
  const updateFlashCardWithIds = updateFlashCard.bind(null, deckId, card.id)
  const deleteFlashCardWithIds = deleteFlashCard.bind(null, deckId, card.id)

  const [state, formAction, isPending] = useActionState(
    updateFlashCardWithIds,
    initialState
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            カードを編集
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            閉じる
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor={`question-${card.id}`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Question
            </label>
            <input
              id={`question-${card.id}`}
              name="question"
              defaultValue={card.question}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor={`answer-${card.id}`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Answer
            </label>
            <input
              id={`answer-${card.id}`}
              name="answer"
              defaultValue={card.answer}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor={`description-${card.id}`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description / Example
            </label>
            <textarea
              id={`description-${card.id}`}
              name="description"
              defaultValue={card.description ?? ""}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
              placeholder="例文や補足情報を入力"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={async () => {
                await deleteFlashCardWithIds()
                onClose()
              }}
              className="rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
            >
              削除する
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isPending ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}