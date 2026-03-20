import Link from "next/link"
import {
  CREATED_WITHIN_OPTIONS,
  QUESTION_LANGUAGE_OPTIONS,
  SORT_OPTIONS,
  type CreatedWithinFilter,
  type QuestionLanguageFilter,
  type SortFilter,
} from "@/features/decks/filters"

type DeckFilterFormProps = {
  questionLanguage: QuestionLanguageFilter
  sort: SortFilter
  hasFilter: boolean
  resetHref: string
  createdWithin?: CreatedWithinFilter
  showCreatedWithin?: boolean
}

export default function DeckFilterForm({
  questionLanguage,
  sort,
  hasFilter,
  resetHref,
  createdWithin = "all",
  showCreatedWithin = true,
}: DeckFilterFormProps) {
  const formClassName = showCreatedWithin
    ? "grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto_auto] md:items-end"
    : "grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end"

  return (
    <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <form className={formClassName}>
        <div>
          <label
            htmlFor="questionLanguage"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            言語
          </label>
          <select
            id="questionLanguage"
            name="questionLanguage"
            defaultValue={questionLanguage}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            {QUESTION_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showCreatedWithin ? (
          <div>
            <label
              htmlFor="createdWithin"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              作成日
            </label>
            <select
              id="createdWithin"
              name="createdWithin"
              defaultValue={createdWithin}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
            >
              {CREATED_WITHIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="sort"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            並び順
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          絞り込む
        </button>

        {hasFilter ? (
          <Link
            href={resetHref}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            リセット
          </Link>
        ) : null}
      </form>
    </section>
  )
}
