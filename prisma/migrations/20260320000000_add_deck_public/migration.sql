-- Add public flag for deck sharing
ALTER TABLE "Deck"
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
