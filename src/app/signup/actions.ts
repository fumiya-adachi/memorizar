"use server"

import { hash } from "bcrypt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { createSessionCookie, sessionCookieName } from "@/lib/session"

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect("/signup?error=メールアドレスとパスワードは必須です")
  }

  if (password.length < 8) {
    redirect("/signup?error=パスワードは8文字以上で入力してください")
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    redirect("/signup?error=このメールアドレスはすでに使用されています")
  }

  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(sessionCookieName, createSessionCookie(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect("/dashboard")
}
