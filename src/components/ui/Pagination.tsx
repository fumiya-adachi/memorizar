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

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={createPageHref(Math.max(1, currentPage - 1))}
        className={`rounded-md border px-3 py-1 text-sm font-medium ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"}`}
        aria-disabled={currentPage === 1}
      >
        前へ
      </Link>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={createPageHref(page)}
          className={`rounded-md border px-3 py-1 text-sm font-medium ${page === currentPage ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      <Link
        href={createPageHref(Math.min(totalPages, currentPage + 1))}
        className={`rounded-md border px-3 py-1 text-sm font-medium ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"}`}
        aria-disabled={currentPage === totalPages}
      >
        次へ
      </Link>
    </nav>
  )
}
