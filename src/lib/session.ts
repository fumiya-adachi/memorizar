import crypto from "node:crypto"

const SESSION_COOKIE_NAME = "memorizar_session"
const SESSION_SECRET = process.env.SESSION_SECRET ?? "memorizar-dev-secret"

type SessionPayload = {
  userId: number
  exp: number
}

function sign(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url")
}

export function createSessionCookie(userId: number) {
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = sign(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function readUserIdFromSessionCookie(cookieValue?: string) {
  if (!cookieValue) return null

  const [payload, signature] = cookieValue.split(".")
  if (!payload || !signature) return null

  const expectedSignature = sign(payload)
  const provided = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (provided.length !== expected.length) return null

  if (!crypto.timingSafeEqual(provided, expected)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload
    if (!parsed.userId || parsed.exp < Date.now()) {
      return null
    }

    return parsed.userId
  } catch {
    return null
  }
}

export const sessionCookieName = SESSION_COOKIE_NAME
