import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { verifyMobileAuthToken } from "@/lib/mobileAuthToken"

type AuthenticatedUser = {
  id: number
  email: string
  name?: string | null
}

/**
 * API Route 用の認証ヘルパー。
 * NextAuth セッション（JWT）を検証してユーザーを返す。
 * 認証失敗時は 401 レスポンスを返す。
 */
export async function requireApiUser(
  req: NextRequest,
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authorization = req.headers.get("authorization")

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim()
    const payload = verifyMobileAuthToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return {
      user: {
        id: payload.userId,
        email: payload.email,
      },
    }
  }

  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return {
    user: {
      id: Number(session.user.id),
      email: session.user.email ?? "",
      name: session.user.name,
    },
  }
}
