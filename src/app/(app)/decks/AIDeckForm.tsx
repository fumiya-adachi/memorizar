"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Select } from "@/components/ui/select"
import { ROUTES } from "@/constants/routes"

export default function AIDeckForm() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [count, setCount] = useState(5)
  const [questionLanguage, setQuestionLanguage] = useState("en-US")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/decks/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          count,
          questionLanguage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "単語帳の生成に失敗しました。")
        return
      }

      router.push(ROUTES.deckDetail(data.deckId))
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("通信に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <Select
          id="questionLanguage"
          name="questionLanguage"
          label="学びたい言語"
          options={[
            { value: "en-US", label: "英語" },
            { value: "es-ES", label: "スペイン語" },
            { value: "fr-FR", label: "フランス語" },
            { value: "de-DE", label: "ドイツ語" },
          ]}
          value={questionLanguage}
          onChange={(e) => setQuestionLanguage(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="topic"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          ジャンル
        </label>
        <input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="旅行"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="count"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          単語数
        </label>
        <input
          id="count"
          type="number"
          min={5}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>
    </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {isLoading ? "生成中..." : "AIで単語帳を作成"}
      </button>
    </form>
  )
}