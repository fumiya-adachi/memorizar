"use client"

import { useActionState } from "react"
import { createFlashCard, type FlashCardState } from "./actions"

type FlashCardFormProps = {
  deckId: number
}

const initialState: FlashCardState = {}

export default function FlashCardForm({ deckId }: FlashCardFormProps) {
  const createFlashCardWithDeckId = createFlashCard.bind(null, deckId)
  const [state, formAction, isPending] = useActionState(
    createFlashCardWithDeckId,
    initialState
  )

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="question"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          問題
        </label>
        <input
          id="question"
          name="question"
          type="text"
          placeholder="hola"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="answer"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          答え
        </label>
        <input
          id="answer"
          name="answer"
          type="text"
          placeholder="こんにちは"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "追加中..." : "カードを追加"}
      </button>
    </form>
  )
}