"use server"

import { compare } from "bcrypt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { createSessionCookie, sessionCookieName } from "@/lib/session"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect("/login?error=メールアドレスとパスワードは必須です")
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    redirect("/login?error=メールアドレスまたはパスワードが正しくありません")
  }

  const valid = await compare(password, user.password)

  if (!valid) {
    redirect("/login?error=メールアドレスまたはパスワードが正しくありません")
  }

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
