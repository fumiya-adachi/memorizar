import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"
import { ROUTES } from "@/constants/routes"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect(ROUTES.decks)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
        <LoginForm />
      </div>
    </main>
  )
}