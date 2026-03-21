import { apiGet, apiPost, saveSessionToken } from "./api"

export type AuthUser = {
  id: number
  email: string
  name?: string | null
}

export async function loginWithPassword(email: string, password: string) {
  const data = await apiPost<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
    email,
    password,
  })

  await saveSessionToken(data.token)
  return data.user
}

export async function fetchMe() {
  const data = await apiGet<{ user: AuthUser }>("/api/v1/auth/me")
  return data.user
}
