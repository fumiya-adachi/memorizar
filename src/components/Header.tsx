"use client"

import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import CloudLearningLogo from "./CloudLearningLogo"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  const hiddenPaths = ["/login", "/signup"]
  const hideLogout = hiddenPaths.includes(pathname)
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-15 py-4">
        <div>
          <Link href="/decks">
            <CloudLearningLogo />
          </Link>
        </div>
        {!hideLogout && <LogoutButton />}
      </div>
    </header>
  )
}
