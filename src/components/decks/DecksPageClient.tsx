"use client"

import { useState } from "react"
import DeckCreationModal from "./DeckCreationModal"

type DecksPageClientProps = {
  children: React.ReactNode
  deckSummariesLength: number
}

export default function DecksPageClient({ children, deckSummariesLength }: DecksPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">あなたの単語帳</h1>
            <p className="mt-2 text-sm text-gray-500">{deckSummariesLength}件</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + 新しい単語帳を作成
          </button>
        </div>

        {children}
      </div>

      <DeckCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
