import { apiGet, apiPost, saveSessionToken } from "./api"

export type AuthUser = {
  id: number
  email: string
  name?: string | null
}

type AuthResponse = {
  token: string
  user: AuthUser
}

async function persistAuthenticatedUser(data: AuthResponse) {
  await saveSessionToken(data.token)
  return data.user
}

export async function loginWithPassword(email: string, password: string) {
  const data = await apiPost<AuthResponse>("/api/v1/auth/login", {
    email,
    password,
  })

  return persistAuthenticatedUser(data)
}

export async function signupWithPassword(input: {
  name?: string
  email: string
  password: string
}) {
  const data = await apiPost<AuthResponse>("/api/v1/auth/signup", input)
  return persistAuthenticatedUser(data)
}

export async function fetchMe() {
  const data = await apiGet<{ user: AuthUser }>("/api/v1/auth/me")
  return data.user
}
