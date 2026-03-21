import Link from "next/link"
import DeckFilterForm from "@/components/decks/DeckFilterForm"
import DecksPageClient from "@/components/decks/DecksPageClient"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/constants/routes"
import { requireCurrentUser } from "@/lib/currentUser"
import {
  getDaysFromFilter,
  getLanguageLabel,
  isCreatedWithinFilter,
  isQuestionLanguageFilter,
  isSortFilter,
} from "@/features/decks/filters"
import { calcImportedDeckCardCount } from "@memorizar/shared/features/decks/cardCount"

type DecksPageProps = {
  searchParams: Promise<{
    questionLanguage?: string
    createdWithin?: string
    sort?: string
  }>
}

export default async function DecksPage({ searchParams }: DecksPageProps) {
  const user = await requireCurrentUser()
  const params = await searchParams

  const questionLanguage =
    params.questionLanguage && isQuestionLanguageFilter(params.questionLanguage)
    ? params.questionLanguage
    : "all"

  const createdWithin = params.createdWithin && isCreatedWithinFilter(params.createdWithin)
    ? params.createdWithin
    : "all"

  const sort = params.sort && isSortFilter(params.sort) ? params.sort : "newest"

  const days = getDaysFromFilter(createdWithin)
  const createdAtFilter = days
    ? {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      }
    : undefined

  const decks = await prisma.deck.findMany({
    where: {
      userId: user.id,
      ...(questionLanguage !== "all" ? { questionLanguage } : {}),
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    },
    orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      sourceDeckId: true,
      questionLanguage: true,
    },
  })

  const deckIds = decks.map((deck) => deck.id)
  const importedDecks = decks.filter((deck) => deck.sourceDeckId !== null)
  const importedDeckIds = importedDecks.map((deck) => deck.id)
  const sourceDeckIds = importedDecks.map((deck) => deck.sourceDeckId!)

  const [localCounts, sourceCounts, overrideCounts] = await Promise.all([
    deckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: {
            deckId: {
              in: deckIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : Promise.resolve([]),
    sourceDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: {
            deckId: {
              in: sourceDeckIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : Promise.resolve([]),
    importedDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: {
            deckId: {
              in: importedDeckIds,
            },
            sourceCardId: {
              not: null,
            },
          },
          _count: {
            _all: true,
          },
        })
      : Promise.resolve([]),
  ])

  const localCountMap = new Map(localCounts.map((item) => [item.deckId, item._count._all]))
  const sourceCountMap = new Map(sourceCounts.map((item) => [item.deckId, item._count._all]))
  const overrideCountMap = new Map(overrideCounts.map((item) => [item.deckId, item._count._all]))

  const deckSummaries = decks.map((deck) => {
    const localCardCount = localCountMap.get(deck.id) ?? 0

    if (deck.sourceDeckId === null) {
      return {
        ...deck,
        cardCount: localCardCount,
      }
    }

    const sourceCardCount = sourceCountMap.get(deck.sourceDeckId) ?? 0
    const overrideCount = overrideCountMap.get(deck.id) ?? 0

    return {
      ...deck,
      cardCount: calcImportedDeckCardCount(sourceCardCount, localCardCount, overrideCount),
    }
  })

  const hasFilter = questionLanguage !== "all" || createdWithin !== "all" || sort !== "newest"

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <DecksPageClient deckSummariesLength={deckSummaries.length}>
        <DeckFilterForm
          questionLanguage={questionLanguage}
          createdWithin={createdWithin}
          sort={sort}
          hasFilter={hasFilter}
          resetHref={ROUTES.decks}
        />

        <section className="mt-8">
          {deckSummaries.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow">
              <p className="text-base font-medium text-gray-900">
                条件に一致する単語帳はありません
              </p>
              <p className="mt-2 text-sm text-gray-500">
                絞り込み条件を変更するか、新しい単語帳を作成してください。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {deckSummaries.map((deck) => (
                <Link
                  key={deck.id}
                  href={ROUTES.deckDetail(deck.id)}
                  className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deck.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        学習言語: {getLanguageLabel(deck.questionLanguage)}
                      </p>
                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {deck.cardCount} cards
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </DecksPageClient>
    </main>
  )
}