"use client"

import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import CloudLearningLogo from "./CloudLearningLogo"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/constants/routes"

export default function Header() {
  const pathname = usePathname()

  const hiddenPaths: string[] = [ROUTES.login, ROUTES.signup]
  const hideHeaderActions = hiddenPaths.includes(pathname)
  const isPublicDecksPage = pathname.startsWith(ROUTES.publicDecks)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-15 py-4">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.decks}>
            <CloudLearningLogo />
          </Link>

          {!hideHeaderActions && (
            <Link
              href={ROUTES.publicDecks}
              className={`text-sm font-medium transition hover:underline underline-offset-4 ${
                isPublicDecksPage ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              みんなの公開単語帳を探す
            </Link>
          )}
        </div>

        {!hideHeaderActions && <LogoutButton />}
      </div>
    </header>
  )
}
