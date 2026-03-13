"use server"

import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

type SignupState = {
  error?: string
}

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get("name")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? ""
  const password = formData.get("password")?.toString() ?? ""

  if (!email || !password) {
    return { error: "メールアドレスとパスワードは必須です。" }
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上にしてください。" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "このメールアドレスは既に使われています。" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    })
  } catch (error) {
    console.error("signup error:", error)
    return { error: "登録に失敗しました。" }
  }

  redirect("/login")
}