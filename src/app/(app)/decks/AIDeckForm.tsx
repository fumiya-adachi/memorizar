"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AIDeckForm() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [count, setCount] = useState(5)
  const [language, setLanguage] = useState("English")
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
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Deck生成に失敗しました。")
        return
      }

      router.push(`/decks/${data.deckId}`)
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
    <div className="space-y-1">
      <label
        htmlFor="language"
        className="block text-sm font-medium text-gray-700"
      >
        学習言語
      </label>

      <select
        id="language"
        name="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      >
        <option value="English">英語</option>
        <option value="Spanish">スペイン語</option>
        <option value="French">フランス語</option>
        <option value="Russian">ロシア語</option>
      </select>
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
          枚数
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {isLoading ? "生成中..." : "AIでDeckを作成"}
      </button>
    </form>
  )
}