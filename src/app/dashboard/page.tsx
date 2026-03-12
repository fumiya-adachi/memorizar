import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { readUserIdFromSessionCookie, sessionCookieName } from "@/lib/session"

import { logout } from "./actions"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(sessionCookieName)?.value
  const userId = readUserIdFromSessionCookie(sessionValue)

  if (!userId) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="mt-2 text-gray-600">単語帳や学習状況をここに表示します。</p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </form>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">今日の復習</h2>
            <p className="mt-2 text-3xl font-bold">12</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">作成したDeck</h2>
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">正答率</h2>
            <p className="mt-2 text-3xl font-bold">78%</p>
          </div>
        </section>
      </div>
    </main>
  )
}
