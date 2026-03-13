import { auth } from "../../auth"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/decks")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
        <p className="mt-2 text-sm text-gray-600">
          アカウントにログインしてください
        </p>

        <LoginForm />
      </div>
    </main>
  )
}