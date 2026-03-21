import "dotenv/config"
import bcrypt from "bcrypt"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { spanishBasicCards } from "./seeds/spanishBasic"
import { engineeringEnglishCards } from "./seeds/englishEngineer"
import { toiecEnglishEnglishCards } from "./seeds/toiecEnglish"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const demoEmail = "demo@example.com"
  const demoPassword = "demo123456"
  const hashedPassword = await bcrypt.hash(demoPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password: hashedPassword,
      name: "Demo User",
    },
  })

  const deckName = "スペイン語 よく使う100単語"

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      name: deckName,
    },
  })

  const deck =
    existingDeck ??
    (await prisma.deck.create({
      data: {
        name: deckName,
        questionLanguage: "es-ES",
        answerLanguage: "ja-JP",
        userId: user.id,
      },
    }))

  const existingCards = await prisma.flashCard.count({
    where: {
      userId: user.id,
      deckId: deck.id,
    },
  })

  const engineeringDeckName = "英語 エンジニアがよく使う100単語"

  const engineeringDeck =
    (await prisma.deck.findFirst({
      where: { userId: user.id, name: engineeringDeckName },
    })) ??
    (await prisma.deck.create({
      data: {
        name: engineeringDeckName,
        questionLanguage: "en-US",
        answerLanguage: "ja-JP",
        userId: user.id,
      },
    }))

  const engineeringCardCount = await prisma.flashCard.count({
    where: { userId: user.id, deckId: engineeringDeck.id },
  })

  const toiecDeckName = "TOEIC よく出る英単語"

  const toiecDeck =
    (await prisma.deck.findFirst({
      where: { userId: user.id, name: toiecDeckName },
    })) ??
    (await prisma.deck.create({
      data: {
        name: toiecDeckName,
        questionLanguage: "en-US",
        answerLanguage: "ja-JP",
        userId: user.id,
      },
    }))

  const toiecCardCount = await prisma.flashCard.count({
    where: { userId: user.id, deckId: toiecDeck.id },
  })

  if (engineeringCardCount === 0) {
    await prisma.flashCard.createMany({
      data: engineeringEnglishCards.map((card) => ({
        userId: user.id,
        deckId: engineeringDeck.id,
        question: card.question,
        answer: card.answer,
      })),
    })
  }

  if (existingCards === 0) {
    await prisma.flashCard.createMany({
      data: spanishBasicCards.map((card) => ({
        userId: user.id,
        deckId: deck.id,
        question: card.question,
        answer: card.answer,
        description: card.description,
      })),
    })
  }

  if (toiecCardCount === 0) {
    await prisma.flashCard.createMany({
      data: toiecEnglishEnglishCards.map((card) => ({
        userId: user.id,
        deckId: toiecDeck.id,
        question: card.question,
        answer: card.answer,
      })),
    })
  }

  console.log("Seed completed 🌱")
  console.log(`Demo user: ${demoEmail}`)
  console.log(`Demo password: ${demoPassword}`)
  console.log(`Deck: ${deckName}`)
}

main()
  .catch((e) => {
    console.error("SEED ERROR:")
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })