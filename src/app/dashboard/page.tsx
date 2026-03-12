export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">単語帳や学習状況をここに表示します。</p>

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