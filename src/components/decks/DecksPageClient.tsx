"use client"

import { useState } from "react"
import DeckCreationModal from "./DeckCreationModal"

type DecksPageClientProps = {
  children: React.ReactNode
  deckSummariesLength: number
}

export default function DecksPageClient({ children, deckSummariesLength }: DecksPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(deckSummariesLength === 0)

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + 新しい単語帳を作成
        </button>
      </div>

      <div>{children}</div>

      <DeckCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
