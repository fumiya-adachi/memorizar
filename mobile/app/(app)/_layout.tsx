import { Redirect, Tabs } from "expo-router"
import { View } from "react-native"
import { useAuth } from "../../src/context/AuthContext"

// ─── View ベースのアイコン（フォント・文字に依存しない）─────────────────────

function IconBook({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      {/* 本の外枠 */}
      <View style={{ width: 16, height: 20, borderRadius: 2, borderWidth: 2, borderColor: color, overflow: "hidden" }}>
        {/* 背表紙の線 */}
        <View style={{ position: "absolute", left: 3, top: 0, bottom: 0, width: 2, backgroundColor: color }} />
      </View>
    </View>
  )
}

function IconSearch({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      {/* 虫眼鏡の丸 */}
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color }} />
      {/* 取っ手 */}
      <View style={{
        position: "absolute", bottom: 1, right: 1,
        width: 6, height: 2, borderRadius: 1,
        backgroundColor: color,
        transform: [{ rotate: "45deg" }],
      }} />
    </View>
  )
}

function IconPerson({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      {/* 頭 */}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginBottom: 2 }} />
      {/* 体 */}
      <View style={{ width: 14, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  )
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const { token } = useAuth()

  if (!token) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#e5e7eb" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
      >
      <Tabs.Screen
        name="explore"
        options={{
          title: "探す",
          tabBarIcon: ({ focused }) => <IconSearch color={focused ? "#111827" : "#9ca3af"} />,
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: "単語帳",
          tabBarIcon: ({ focused }) => <IconBook color={focused ? "#111827" : "#9ca3af"} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ focused }) => <IconPerson color={focused ? "#111827" : "#9ca3af"} />,
        }}
      />
    </Tabs>
  )
}
