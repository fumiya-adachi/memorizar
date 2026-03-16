"use client"

import { useTransition } from "react"

type DeleteDeckButtonProps = {
  deckId: number
  onDelete: (deckId: number) => Promise<void>
}

export default function DeleteDeckButton({
  deckId,
  onDelete,
}: DeleteDeckButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const shouldDelete = window.confirm(
      "この単語帳を削除しますか？登録済みカードも削除されます。"
    )

    if (!shouldDelete) {
      return
    }

    startTransition(async () => {
      await onDelete(deckId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "削除中..." : "単語帳を削除"}
    </button>
  )
}
