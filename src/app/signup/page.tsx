"use client"

import { useActionState } from "react"
import { signup } from "./actions"

const initialState = {
  error: "",
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>
        <p className="mt-2 text-sm text-gray-600">
          アカウントを作成してください
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
              placeholder="Fumiya"
            />
          </div>

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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
              placeholder="you@example.com"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
              placeholder="8文字以上"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "登録中..." : "新規登録"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <a href="/login" className="font-medium text-gray-900 underline">
            ログイン
          </a>
        </p>
      </div>
    </main>
  )
}