import "dotenv/config"
import bcrypt from "bcrypt"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { spanishBasicCards } from "./seeds/spanishBasic"

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
        userId: user.id,
      },
    }))

  const existingCards = await prisma.flashCard.count({
    where: {
      userId: user.id,
      deckId: deck.id,
    },
  })

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