import OpenAI from "openai"
import { z } from "zod"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const RequestSchema = z.object({
  topic: z.string().min(1),
  count: z.number().int().min(5).max(50),
  language: z.string().min(1),
})

const GeneratedDeckSchema = z.object({
  deckName: z.string(),
  cards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      description: z.string().nullable(),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsedRequest = RequestSchema.safeParse(body)

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { topic, count, language } = parsedRequest.data

    const response = await client.responses.create({
      model: "gpt-5.4",
      reasoning: { effort: "medium" },
      instructions:
        `あなたは語学学習アプリ用の教材作成アシスタントです。日本語話者向けに、${language}の単語カードを作ります。`,
      input: `
        以下の条件でフラッシュカード用データを生成してください。

        - ジャンル: ${topic}
        - 枚数: ${count}
        - question: ${language}の単語または短い表現
        - answer: 日本語訳
        - description: ${language}の短い例文。不要なら null
        - deckName: ジャンルに合う自然な日本語タイトル

        出力は JSON のみ。
        `,
      text: {
        format: {
          type: "json_schema",
          name: "generated_deck",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              deckName: { type: "string" },
              cards: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                    description: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                  },
                  required: ["question", "answer", "description"],
                },
              },
            },
            required: ["deckName", "cards"],
          },
        },
      },
    })

    const parsedDeck = GeneratedDeckSchema.safeParse(
      JSON.parse(response.output_text)
    )

    if (!parsedDeck.success) {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      )
    }

    const { deckName, cards } = parsedDeck.data

    const deck = await prisma.deck.create({
      data: {
        name: deckName,
        userId: user.id,
      },
    })

    await prisma.flashCard.createMany({
      data: cards.map((card) => ({
        userId: user.id,
        deckId: deck.id,
        question: card.question,
        answer: card.answer,
        description: card.description,
      })),
    })

    return NextResponse.json({
      success: true,
      deckId: deck.id,
      deckName: deck.name,
      cardCount: cards.length,
    })
  } catch (error: any) {
    console.error("generate deck api error:", error)

    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error:
            "OpenAI API の利用枠が不足しています。Billing / quota を確認してください。",
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate deck",
      },
      { status: 500 }
    )
  }
}