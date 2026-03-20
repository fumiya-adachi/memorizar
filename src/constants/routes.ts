export const ROUTES = {
  login: "/login",
  signup: "/signup",
  decks: "/decks",
  publicDecks: "/decks/public",
  deckDetail: (id: number) => `/decks/${id}`,
  deckReview: (id: number) => `/decks/${id}/review`,
} as const