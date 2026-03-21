import crypto from "node:crypto"

type MobileAuthTokenPayload = {
  userId: number
  email: string
  exp: number
}

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set")
  }

  return secret
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url")
}

export function createMobileAuthToken(user: {
  userId: number
  email: string
  expiresInSeconds?: number
}) {
  const payload: MobileAuthTokenPayload = {
    userId: user.userId,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (user.expiresInSeconds ?? 60 * 60 * 24 * 30),
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = sign(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyMobileAuthToken(token: string): MobileAuthTokenPayload | null {
  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = sign(encodedPayload)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (receivedBuffer.length !== expectedBuffer.length) {
    return null
  }

  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null
  }

  let payload: MobileAuthTokenPayload

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
  } catch {
    return null
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}
