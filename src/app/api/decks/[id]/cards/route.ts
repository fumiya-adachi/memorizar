import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { CardData } from "@memorizar/shared"

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const deckId = Number(id)
  if (Number.isNaN(deckId)) {
    return NextResponse.json({ error: "Invalid deck id" }, { status: 400 })
  }

  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id } })
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  const cards = await prisma.flashCard.findMany({
    where: { deckId },
    orderBy: { createdAt: "asc" },
    select: { id: true, question: true, answer: true, description: true },
  })

  return NextResponse.json(cards satisfies CardData[])
}

export async function POST(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const deckId = Number(id)
  if (Number.isNaN(deckId)) {
    return NextResponse.json({ error: "Invalid deck id" }, { status: 400 })
  }

  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id } })
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  const body = await request.json()
  const question = String(body.question ?? "").trim()
  const answer = String(body.answer ?? "").trim()

  if (!question || !answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 })
  }

  const card = await prisma.flashCard.create({
    data: { deckId, userId: user.id, question, answer },
    select: { id: true, question: true, answer: true, description: true },
  })

  return NextResponse.json(card satisfies CardData, { status: 201 })
}
