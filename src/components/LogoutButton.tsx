"use client"

import { logout } from "@/app/logout/actions"

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm font-medium text-gray-600 transition hover:text-gray-900 cursor-pointer"
      >
        ログアウト
      </button>
    </form>
  )
}