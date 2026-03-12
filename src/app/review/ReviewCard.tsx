"use client"

import { useState } from "react"
import { markFlashCardResult } from "./actions"

type ReviewCardProps = {
  card: {
    id: number
    question: string
    answer: string
    deckName: string
  }
}

export default function ReviewCard({ card }: ReviewCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  const submitResult = async (isCorrect: boolean) => {
    await markFlashCardResult(card.id, isCorrect)
    window.location.reload()
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

      {showAnswer ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Answer
          </p>
          <p className="mt-3 text-xl text-gray-800">{card.answer}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAnswer(true)}
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
        >
          答えを見る
        </button>
      )}

      {showAnswer ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => submitResult(false)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 hover:bg-red-100"
          >
            不正解
          </button>

          <button
            type="button"
            onClick={() => submitResult(true)}
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700 hover:bg-green-100"
          >
            正解
          </button>
        </div>
      ) : null}
    </div>
  )
}