import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ROUTES } from "@/constants/routes"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  return user
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(ROUTES.login)
  }

  return user
}
