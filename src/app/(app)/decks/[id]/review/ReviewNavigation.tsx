import Link from "next/link"

type ReviewNavigationProps = {
  currentIndex: number
  totalCount: number
  prevHref: string
  nextHref: string
}

export default function ReviewNavigation({
  currentIndex,
  totalCount,
  prevHref,
  nextHref,
}: ReviewNavigationProps) {
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < totalCount - 1

  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
      {hasPrev ? (
        <Link
          href={prevHref}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← 前の問題
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 font-medium text-gray-400"
        >
          ← 前の問題
        </button>
      )}

      <p className="font-medium text-gray-600">
        {currentIndex + 1} / {totalCount}
      </p>

      {hasNext ? (
        <Link
          href={nextHref}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          次の問題 →
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 font-medium text-gray-400"
        >
          次の問題 →
        </button>
      )}
    </div>
  )
}
