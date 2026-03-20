"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { getCurrentUser } from "@/lib/currentUser"
import { prisma } from "@/lib/prisma"

async function buildImportedDeckName(userId: number, sourceName: string) {
  let candidate = sourceName
  let suffix = 2

  while (true) {
    const existing = await prisma.deck.findFirst({
      where: {
        userId,
        name: candidate,
      },
      select: { id: true },
    })

    if (!existing) {
      return candidate
    }

    candidate = `${sourceName} (${suffix})`
    suffix += 1
  }
}

export async function importPublicDeck(publicDeckId: number) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(ROUTES.login)
  }

  const sourceDeck = await prisma.deck.findFirst({
    where: {
      id: publicDeckId,
      isPublic: true,
      sourceDeckId: null,
      NOT: {
        userId: user.id,
      },
    },
  })

  if (!sourceDeck) {
    redirect(ROUTES.publicDecks)
  }

  const existingImportedDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      sourceDeckId: sourceDeck.id,
    },
    select: {
      id: true,
    },
  })

  if (existingImportedDeck) {
    redirect(ROUTES.deckDetail(existingImportedDeck.id))
  }

  const importedName = await buildImportedDeckName(user.id, sourceDeck.name)

  const importedDeck = await prisma.deck.create({
    data: {
      userId: user.id,
      sourceDeckId: sourceDeck.id,
      name: importedName,
      questionLanguage: sourceDeck.questionLanguage,
      answerLanguage: sourceDeck.answerLanguage,
      isPublic: false,
    },
  })

  revalidatePath(ROUTES.publicDecks)
  revalidatePath(ROUTES.decks)
  redirect(ROUTES.deckDetail(importedDeck.id))
}
