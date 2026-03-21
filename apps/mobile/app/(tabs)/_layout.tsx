import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "単語帳", tabBarLabel: "単語帳" }}
      />
    </Tabs>
  )
}
