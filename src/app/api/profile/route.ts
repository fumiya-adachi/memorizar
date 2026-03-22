import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"

export async function PUT(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : undefined
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined

  if (email !== undefined) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: user.id } },
    })
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 })
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: name || null }),
      ...(email !== undefined && { email }),
    },
    select: { name: true, email: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ユーザーに紐づく全データを順番に削除
  const cardIds = await prisma.flashCard.findMany({
    where: { userId: user.id },
    select: { id: true },
  }).then((cards) => cards.map((c) => c.id))

  await prisma.$transaction([
    prisma.reviewHistory.deleteMany({ where: { userId: user.id } }),
    prisma.flashCardProgress.deleteMany({ where: { userId: user.id } }),
    prisma.flashCard.deleteMany({ where: { userId: user.id } }),
    prisma.deck.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ])

  return new NextResponse(null, { status: 204 })
}
