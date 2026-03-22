export type CreatedWithinFilter = "all" | "7d" | "30d" | "365d"
export type SortFilter = "newest" | "oldest"

export const QUESTION_LANGUAGE_OPTIONS = [
  { value: "all", label: "すべての言語" },
  { value: "en-US", label: "英語" },
  { value: "es-ES", label: "スペイン語" },
  { value: "fr-FR", label: "フランス語" },
  { value: "de-DE", label: "ドイツ語" },
] as const

export type QuestionLanguageFilter = (typeof QUESTION_LANGUAGE_OPTIONS)[number]["value"]

export const SORT_OPTIONS: { value: SortFilter; label: string }[] = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
]

export const CREATED_WITHIN_OPTIONS: { value: CreatedWithinFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "7d", label: "過去7日" },
  { value: "30d", label: "過去30日" },
  { value: "365d", label: "過去1年" },
]

export function isCreatedWithinFilter(value: string): value is CreatedWithinFilter {
  return ["all", "7d", "30d", "365d"].includes(value)
}

export function isSortFilter(value: string): value is SortFilter {
  return ["newest", "oldest"].includes(value)
}

export function isQuestionLanguageFilter(value: string): value is QuestionLanguageFilter {
  return QUESTION_LANGUAGE_OPTIONS.some((option) => option.value === value)
}

export function getDaysFromFilter(filter: CreatedWithinFilter) {
  switch (filter) {
    case "7d":
      return 7
    case "30d":
      return 30
    case "365d":
      return 365
    default:
      return null
  }
}

export function getLanguageLabel(value: string | null) {
  if (!value) {
    return "指定なし"
  }

  return QUESTION_LANGUAGE_OPTIONS.find((option) => option.value === value)?.label ?? value
}
