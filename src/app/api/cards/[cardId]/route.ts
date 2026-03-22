import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { CardData } from "@memorizar/shared"

type Params = { params: Promise<{ cardId: string }> }

export async function PUT(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { cardId } = await params
  const id = Number(cardId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id" }, { status: 400 })
  }

  const card = await prisma.flashCard.findFirst({ where: { id, userId: user.id } })
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  const body = await request.json()
  const question = String(body.question ?? "").trim()
  const answer = String(body.answer ?? "").trim()

  if (!question || !answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 })
  }

  const updated = await prisma.flashCard.update({
    where: { id },
    data: { question, answer },
    select: { id: true, question: true, answer: true, description: true },
  })

  return NextResponse.json(updated satisfies CardData)
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { cardId } = await params
  const id = Number(cardId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id" }, { status: 400 })
  }

  const card = await prisma.flashCard.findFirst({ where: { id, userId: user.id } })
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  await prisma.flashCard.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
