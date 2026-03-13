"use server"

import { AuthError } from "next-auth"
import { signIn } from "../../auth"

type LoginState = {
  error?: string
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? ""
  const password = formData.get("password")?.toString() ?? ""

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/decks",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "メールアドレスまたはパスワードが正しくありません。" }
        default:
          return { error: "ログインに失敗しました。" }
      }
    }

    throw error
  }

  return {}
}