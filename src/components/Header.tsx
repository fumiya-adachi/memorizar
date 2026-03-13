import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/decks"
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            Memorizar
          </Link>
        </div>

        <LogoutButton />
      </div>
    </header>
  )
}