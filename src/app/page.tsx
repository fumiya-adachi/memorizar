import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">Memorizar</h1>
        <p className="mt-3 text-gray-600">単語学習アプリへようこそ。ログインして学習を開始しましょう。</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-5 py-3 text-center font-medium text-white hover:bg-gray-800"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-100"
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  )
}
