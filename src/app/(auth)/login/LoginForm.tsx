"use client"

import { useActionState } from "react"
import { login } from "./actions"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

const initialState = {
  error: "",
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          placeholder="パスワードを入力"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
      <p className="mt-6 text-sm text-gray-600">
          アカウントをお持ちでないですか？{" "}
        <Link href={ROUTES.signup} className="font-medium text-gray-900 underline">
          新規登録
        </Link>
      </p>
    </form>
  )
}