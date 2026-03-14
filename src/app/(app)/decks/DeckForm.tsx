"use client"

import { useActionState } from "react"
import { createDeck, type DeckState } from "./actions"

const initialState: DeckState = {}

export default function DeckForm() {
  const [state, formAction, isPending] = useActionState(createDeck, initialState)

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          単語帳名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="スペイン語 基本単語"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "作成中..." : "単語帳を作成"}
      </button>
    </form>
  )
}