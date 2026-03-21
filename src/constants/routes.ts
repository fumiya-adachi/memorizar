export const ROUTES = {
  login: "/login",
  signup: "/signup",
  decks: "/decks",
  publicDecks: "/decks/public",
  publicDeckDetail: (id: number) => `/decks/public/${id}`,
  deckDetail: (id: number) => `/decks/${id}`,
  deckReview: (id: number) => `/decks/${id}/review`,
} as const