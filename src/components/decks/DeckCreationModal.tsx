"use client"

import { useState } from "react"
import AIDeckForm from "@/app/(app)/decks/AIDeckForm"
import DeckForm from "@/app/(app)/decks/DeckForm"

type DeckCreationModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function DeckCreationModal({ isOpen, onClose }: DeckCreationModalProps) {
  const [tab, setTab] = useState<"ai" | "manual">("ai")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="h-[360px] w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl flex flex-col">
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">単語帳を作成</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 flex shrink-0 gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab("ai")}
            className={`px-4 py-2 font-medium transition ${
              tab === "ai"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            AI自動作成
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`px-4 py-2 font-medium transition ${
              tab === "manual"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            手動作成
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1">
          {tab === "ai" ? <AIDeckForm /> : <DeckForm />}
        </div>
      </div>
    </div>
  )
}
