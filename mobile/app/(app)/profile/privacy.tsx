import { ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>
}

function Ul({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <Text key={i} style={styles.listItem}>・{item}</Text>
      ))}
    </View>
  )
}

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>最終更新日：2026年◯月◯日</Text>
        <P>
          本プライバシーポリシー（以下「本ポリシー」）は、当アプリ（以下「本サービス」）における個人情報の取り扱いについて定めるものです。
        </P>

        <Section title="第1条（収集する情報）">
          <P>本サービスでは、以下の情報を収集します。</P>
          <Ul items={[
            "メールアドレス（アカウント登録・認証に使用）",
            "表示名（任意。プロフィール表示に使用）",
            "ユーザーが作成・登録した単語帳およびカードのデータ",
            "学習履歴・正答率などの学習データ",
          ]} />
        </Section>

        <Section title="第2条（情報の利用目的）">
          <P>収集した情報は、以下の目的にのみ使用します。</P>
          <Ul items={[
            "アカウントの認証・管理",
            "学習機能の提供および学習進捗の表示",
            "サービスの改善・不具合対応",
            "お問い合わせへの対応",
          ]} />
        </Section>

        <Section title="第3条（第三者への提供）">
          <P>運営者は、以下のいずれかに該当する場合を除き、ユーザーの個人情報を第三者に提供しません。</P>
          <Ul items={[
            "ユーザーの同意がある場合",
            "法令に基づく場合",
            "人の生命・身体・財産の保護のために必要な場合",
          ]} />
        </Section>

        <Section title="第4条（データの保存・管理）">
          <P>収集した情報は、適切なセキュリティ対策を講じたサーバー上に保存します。運営者は、不正アクセス・紛失・漏洩の防止に努めますが、完全な安全性を保証するものではありません。</P>
        </Section>

        <Section title="第5条（データの保持期間）">
          <P>ユーザーのデータは、アカウントが有効である間保持されます。アカウントを削除した場合、関連するデータは合理的な期間内に削除されます。</P>
        </Section>

        <Section title="第6条（ユーザーの権利）">
          <P>ユーザーは、自己の個人情報について以下の権利を有します。</P>
          <Ul items={[
            "開示・確認の請求",
            "訂正・削除の請求",
            "利用停止の請求",
          ]} />
          <P style={styles.mt}>これらの請求は、本サービス内のお問い合わせ手段を通じて行うことができます。</P>
        </Section>

        <Section title="第7条（Cookieおよびトークン）">
          <P>本サービスでは、認証のために認証トークンを端末のセキュアストレージに保存します。これはサービスの提供に必要なものであり、広告目的での使用は行いません。</P>
        </Section>

        <Section title="第8条（外部サービス）">
          <P>本サービスは現在、広告配信・アクセス解析等の外部トラッキングサービスを使用していません。将来的に導入する場合は、本ポリシーを更新してお知らせします。</P>
        </Section>

        <Section title="第9条（未成年者の利用）">
          <P>本サービスは年齢制限を設けていませんが、未成年者が利用する場合は保護者の同意のもとで利用してください。</P>
        </Section>

        <Section title="第10条（ポリシーの変更）">
          <P>運営者は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせします。変更後のポリシーは、掲載した時点で効力を生じます。</P>
        </Section>

        <Section title="第11条（準拠法・管轄）">
          <P>本ポリシーは日本法に準拠します。本ポリシーに関して紛争が生じた場合、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</P>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>附則：本ポリシーは、2026年◯月◯日より施行します。</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, paddingBottom: 48 },
  updated: { fontSize: 12, color: "#9ca3af", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 8 },
  body: { fontSize: 14, color: "#374151", lineHeight: 22 },
  mt: { marginTop: 10 },
  list: { marginTop: 8, gap: 4 },
  listItem: { fontSize: 14, color: "#374151", lineHeight: 22 },
  footer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  footerText: { fontSize: 12, color: "#9ca3af" },
})
