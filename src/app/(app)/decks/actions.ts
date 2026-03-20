"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { getCurrentUser } from "@/lib/currentUser"

export type DeckState = {
  error?: string
}

export async function createDeck(
  _prevState: DeckState,
  formData: FormData
): Promise<DeckState> {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const name = formData.get("name")?.toString().trim() ?? ""
  const questionLanguage = formData.get("questionLanguage")?.toString() || null
  const answerLanguage = formData.get("answerLanguage")?.toString() || null

  if (!name) {
    return { error: "単語帳名を入力してください。" }
  }

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      name,
    },
  })

  if (existingDeck) {
    return { error: "同じ名前の単語帳名が既に存在します。" }
  }

  const deck = await prisma.deck.create({
    data: {
      name,
      userId: user.id,
      questionLanguage: questionLanguage,
      answerLanguage: answerLanguage,
    },
  })

  redirect(`${ROUTES.deckDetail(deck.id)}`)
}