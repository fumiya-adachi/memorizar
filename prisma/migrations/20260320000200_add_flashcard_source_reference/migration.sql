-- Allow imported decks to override source flashcards without mutating originals
ALTER TABLE "FlashCard"
ADD COLUMN "sourceCardId" INTEGER;

ALTER TABLE "FlashCard"
ADD CONSTRAINT "FlashCard_sourceCardId_fkey"
FOREIGN KEY ("sourceCardId") REFERENCES "FlashCard"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "FlashCard_deckId_sourceCardId_key" ON "FlashCard"("deckId", "sourceCardId");
