"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { markFlashCardResult } from "./actions"

type ReviewCardProps = {
  card: {
    id: number
    question: string
    answer: string
    description: string | null
    deckName: string
  }
}

export default function ReviewCard({ card }: ReviewCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setShowAnswer(false)
  }, [card.id])

  const submitResult = (isCorrect: boolean) => {
    startTransition(async () => {
      await markFlashCardResult(card.id, isCorrect)
      router.refresh()
    })
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {card.deckName}
        </span>
      </div>

      <div className="rounded-2xl bg-gray-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Question
        </p>
        <p className="mt-3 text-2xl font-bold text-gray-900">
          {card.question}
        </p>
      </div>

      {showAnswer && (
        <>
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Answer
            </p>
            <p className="mt-3 text-xl text-gray-800">{card.answer}</p>
          </div>

          {card.description && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Description
              </p>
              <p className="mt-3 text-lg text-gray-700">{card.description}</p>
            </div>
          )}
        </>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          type="button"
          disabled={showAnswer || isPending}
          onClick={() => setShowAnswer(true)}
          className="rounded-xl bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-40 cursor-pointer"
        >
          答えを見る
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submitResult(false)}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 disabled:opacity-40 cursor-pointer"
        >
          {isPending ? "処理中..." : "不正解"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => submitResult(true)}
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700 disabled:opacity-40 cursor-pointer"
        >
          {isPending ? "処理中..." : "正解"}
        </button>
      </div>
    </div>
  )
}