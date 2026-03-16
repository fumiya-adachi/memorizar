"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { updateDeckName, type DeckNameState } from "./actions"

type EditDeckNameFormProps = {
  deckId: number
  deckName: string
}

const initialState: DeckNameState = {}

export default function EditDeckNameForm({
  deckId,
  deckName,
}: EditDeckNameFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(deckName)
  const [draftName, setDraftName] = useState(deckName)
  const [showToast, setShowToast] = useState(false)
  const prevPendingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const toastTimerRef = useRef<number | null>(null)

  const updateDeckNameWithId = updateDeckName.bind(null, deckId)
  const [state, formAction, isPending] = useActionState(
    updateDeckNameWithId,
    initialState
  )

  useEffect(() => {
    setDisplayName(deckName)
    setDraftName(deckName)
  }, [deckName])

  useEffect(() => {
    if (prevPendingRef.current && !isPending && !state.error) {
      const nextName = draftName.trim()
      setDisplayName(nextName)
      setDraftName(nextName)
      setIsEditing(false)

      setShowToast(true)
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = window.setTimeout(() => {
        setShowToast(false)
      }, 2200)
    }

    prevPendingRef.current = isPending
  }, [isPending, state.error, draftName])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const cancelEditing = () => {
    setDraftName(displayName)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 truncate text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {displayName}
          </h1>
          <button
            type="button"
            aria-label="単語帳名を編集"
            onClick={() => {
              setDraftName(displayName)
              setIsEditing(true)
            }}
            className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-3 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-white hover:text-gray-900 hover:shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition group-hover:rotate-[-8deg]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 113 2.97L8.37 17.95l-4.42 1.45 1.45-4.42L16.862 3.487z" />
            </svg>
          </button>
        </div>

        {showToast ? (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
            単語帳名を更新しました
          </div>
        ) : null}
      </>
    )
  }

  return (
    <>
      <form ref={formRef} action={formAction} className="mt-2 flex w-full flex-wrap items-center gap-2 md:max-w-3xl">
        <label htmlFor="deck-name" className="sr-only">
          単語帳名
        </label>
        <input
          id="deck-name"
          name="name"
          type="text"
          value={draftName}
          autoFocus
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault()
              formRef.current?.requestSubmit()
            }

            if (event.key === "Escape") {
              event.preventDefault()
              cancelEditing()
            }
          }}
          className="min-w-0 flex-1 rounded-md border-b-2 border-gray-300 bg-transparent px-1 py-1 text-3xl font-bold tracking-tight text-gray-900 outline-none transition focus:border-gray-900 md:min-w-[32rem] md:text-4xl"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          保存
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={cancelEditing}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          キャンセル
        </button>
        {isPending ? <span className="text-xs text-gray-500">保存中…</span> : null}
      </form>

      {state.error ? <p className="mt-1 text-sm text-red-600">{state.error}</p> : null}

      {showToast ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          単語帳名を更新しました
        </div>
      ) : null}
    </>
  )
}
