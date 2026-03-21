import { apiRequest } from "./client"

type SignInResponse = {
  token: string
}

export async function mobileSignIn(email: string, password: string): Promise<string> {
  const { token } = await apiRequest<SignInResponse>("/api/auth/mobile-signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return token
}
