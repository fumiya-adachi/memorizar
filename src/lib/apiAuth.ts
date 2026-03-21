import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

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
