import Link from "next/link"
import { prisma } from "@/lib/prisma"
import DeckForm from "./DeckForm"
import AIDeckForm from "./AIDeckForm"
import { ROUTES } from "@/constants/routes"
import { requireCurrentUser } from "@/lib/currentUser"

export default async function DecksPage() {
  const user = await requireCurrentUser()

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      sourceDeckId: true,
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
      cardCount: Math.max(0, sourceCardCount + localCardCount - overrideCount),
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              単語帳リスト
            </h1>
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          <details open>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">
              AIで単語帳を自動作成
            </summary>
            <div className="mt-4">
              <AIDeckForm />
            </div>
          </details>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          <details open={decks.length === 0}>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">
              手動で単語帳を作成
            </summary>
            <div className="mt-4">
              <DeckForm />
            </div>
          </details>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">あなたの単語帳</h2>
            <p className="text-sm text-gray-500">{deckSummaries.length}件</p>
          </div>

          {deckSummaries.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow">
              <p className="text-base font-medium text-gray-900">
                まだDeckがありません
              </p>
              <p className="mt-2 text-sm text-gray-500">
                最初の単語帳を作成して、暗記カードを追加していきましょう。
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
                        作成日:{" "}
                        {new Date(deck.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {deck.cardCount} cards
                    </div>
                  </div>

                  {/* <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      単語帳を開く
                    </span>
                    <span className="text-lg text-gray-400">→</span>
                  </div> */}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}