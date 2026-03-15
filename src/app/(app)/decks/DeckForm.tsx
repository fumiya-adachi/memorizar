"use client"

import { useActionState } from "react"
import { createDeck, type DeckState } from "./actions"
import { Select } from "@/components/ui/select"

const initialState: DeckState = {}

export default function DeckForm() {
  const [state, formAction, isPending] = useActionState(createDeck, initialState)

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Select
            id="questionLanguage"
            name="questionLanguage"
            label="学びたい言語"
            options={[
              { value: "", label: "指定なし" },
              { value: "en-US", label: "英語" },
              { value: "es-ES", label: "スペイン語" },
              { value: "fr-FR", label: "フランス語" },
              { value: "de-DE", label: "ドイツ語" },
            ]}
            defaultValue="en-US"
          />
        </div>

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
            placeholder="英語 基本100単語"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
          />
        </div>
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