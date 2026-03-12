"use client"

import { logout } from "@/app/logout/actions"

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-2 text-white"
      >
        ログアウト
      </button>
    </form>
  )
}