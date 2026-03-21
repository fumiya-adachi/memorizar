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

  const name = typeof (body as Record<string, unknown>).name === "string"
    ? (body as { name: string }).name.trim()
    : ""
  const email = (body as { email: string }).email.trim().toLowerCase()
  const password = (body as { password: string }).password

  if (!email || !password) {
    return NextResponse.json({ error: "メールアドレスとパスワードは必須です。" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上にしてください。" }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json({ error: "このメールアドレスは既に使われています。" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
    },
  })

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
