"use client"

import { useActionState, useEffect, useState } from "react"
import {
  updateDeckVisibility,
  type DeckVisibilityState,
} from "./actions"

type EditDeckVisibilityFormProps = {
  deckId: number
  isPublic: boolean
}

const initialState: DeckVisibilityState = {}

export default function EditDeckVisibilityForm({
  deckId,
  isPublic,
}: EditDeckVisibilityFormProps) {
  const updateDeckVisibilityWithId = updateDeckVisibility.bind(null, deckId)
  const [state, formAction, isPending] = useActionState(
    updateDeckVisibilityWithId,
    initialState
  )
  const [checked, setChecked] = useState(isPublic)

  useEffect(() => {
    setChecked(isPublic)
  }, [isPublic])

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isPublic"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        公開単語帳として公開する
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {isPending ? "保存中..." : "公開設定を保存"}
      </button>

      <p className="text-xs text-gray-500">
        現在: {checked ? "公開中" : "非公開"}
      </p>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  )
}
