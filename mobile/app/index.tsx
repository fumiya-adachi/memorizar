import { Redirect } from "expo-router"
import { useAuth } from "../src/context/AuthContext"

export default function Index() {
  const { token } = useAuth()

  if (token) {
    return <Redirect href="/(app)/decks" />
  }

  return <Redirect href="/(auth)/login" />
}
