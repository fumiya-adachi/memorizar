import { redirect } from "next/navigation"
import { auth } from "../auth"
import { ROUTES } from "@/constants/routes"

export default async function Page() {
  const session = await auth()

  if (session?.user) {
    redirect(ROUTES.decks)
  }

  redirect(ROUTES.login)
}