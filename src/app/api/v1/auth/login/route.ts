import bcrypt from "bcrypt"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createMobileAuthToken } from "@/lib/mobileAuthToken"

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).email !== "string" ||
    typeof (body as Record<string, unknown>).password !== "string"
  ) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 })
  }

  const email = (body as { email: string }).email.trim().toLowerCase()
  const password = (body as { password: string }).password

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.password)

  if (!ok) {
    return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 })
  }

  const token = createMobileAuthToken({
    userId: user.id,
    email: user.email,
  })

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  })
}
