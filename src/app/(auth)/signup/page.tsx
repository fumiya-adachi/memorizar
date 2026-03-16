import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SignupForm from "./SignupForm"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default async function SignupPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/decks")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>

        <SignupForm />

        <p className="mt-6 text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <Link href={ROUTES.login} className="font-medium text-gray-900 underline">
            ログイン
          </Link>
        </p>
      </div>
    </main>
  )
}