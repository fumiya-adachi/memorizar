import Link from "next/link"

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const createPageHref = (page: number) => {
    return `${basePath}?page=${page}`
  }

  const pageLinks: (number | "...")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageLinks.push(i)
    }
  } else {
    pageLinks.push(1)

    if (currentPage > 4) {
      pageLinks.push("...")
    }

    const start = Math.max(2, Math.min(currentPage - 1, totalPages - 4))
    const end = Math.min(totalPages - 1, Math.max(currentPage + 1, 5))

    for (let i = start; i <= end; i++) {
      pageLinks.push(i)
    }

    if (currentPage < totalPages - 3) {
      pageLinks.push("...")
    }

    pageLinks.push(totalPages)
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={createPageHref(currentPage - 1)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← 前へ
        </Link>
      )}

      {pageLinks.map((item, index) =>
        item === "..." ? (
          <span key={`dot-${index}`} className="px-3 py-1 text-sm text-gray-500">
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={createPageHref(item)}
            className={`rounded-md border px-3 py-1 text-sm font-medium ${item === currentPage ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={createPageHref(currentPage + 1)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          次へ →
        </Link>
      )}
    </nav>
  )
}
