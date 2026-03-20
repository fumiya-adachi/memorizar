-- Avoid flashcard duplication by linking imported decks to source decks
ALTER TABLE "Deck"
ADD COLUMN "sourceDeckId" INTEGER;

ALTER TABLE "Deck"
ADD CONSTRAINT "Deck_sourceDeckId_fkey"
FOREIGN KEY ("sourceDeckId") REFERENCES "Deck"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Deck_userId_sourceDeckId_key" ON "Deck"("userId", "sourceDeckId");
