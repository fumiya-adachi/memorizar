"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export type DeckState = {
  error?: string
}

export async function createDeck(
  _prevState: DeckState,
  formData: FormData
): Promise<DeckState> {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "ログインが必要です。" }
  }

  const name = formData.get("name")?.toString().trim() ?? ""

  if (!name) {
    return { error: "Deck名を入力してください。" }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return { error: "ユーザーが見つかりません。" }
  }

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      name,
    },
  })

  if (existingDeck) {
    return { error: "同じ名前のDeckが既に存在します。" }
  }

  const deck = await prisma.deck.create({
    data: {
      name,
      userId: user.id,
    },
  })

  redirect(`/decks/${deck.id}`)
}