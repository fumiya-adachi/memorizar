import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/apiAuth"

export async function GET(req: NextRequest) {
  const result = await requireApiUser(req)

  if (result instanceof NextResponse) {
    return result
  }

  return NextResponse.json({ user: result.user })
}
