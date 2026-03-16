"use client"

import { useActionState } from "react"
import { signup } from "./actions"

type SignupState = {
  error?: string
}

const initialState: SignupState = {}

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

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
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900 text-gray-900"
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
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900 text-gray-900"
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
  )
}