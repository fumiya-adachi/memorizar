import { jwtVerify } from "jose"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { User } from "@/generated/prisma/client"

/**
 * Cookie セッション (web) と Bearer トークン (mobile) の両方に対応したユーザー取得
 */
export async function getApiUser(request: Request): Promise<User | null> {
  // Bearer トークン優先 (mobile)
  const authorization = request.headers.get("Authorization")
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7)
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)
      if (typeof payload.userId !== "number") return null
      return prisma.user.findUnique({ where: { id: payload.userId } })
    } catch {
      return null
    }
  }

  // NextAuth セッション (web / cookie)
  const session = await auth()
  if (!session?.user?.email) return null
  return prisma.user.findUnique({ where: { email: session.user.email } })
}
