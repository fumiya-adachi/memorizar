export const ROUTES = {
  login: "/login",
  signup: "/signup",
  decks: "/decks",
  deckDetail: (id: number) => `/decks/${id}`,
  deckReview: (id: number) => `/decks/${id}/review`,
} as const