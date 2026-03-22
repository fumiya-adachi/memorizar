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

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>最終更新日：2026年◯月◯日</Text>
        <P>
          本利用規約（以下「本規約」）は、当アプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
        </P>

        <Section title="第1条（適用）">
          <P>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。</P>
        </Section>

        <Section title="第2条（利用登録）">
          <P>ユーザーは、本規約に同意の上、所定の方法により登録を行うことで、本サービスを利用できます。</P>
        </Section>

        <Section title="第3条（アカウント管理）">
          <P>ユーザーは、自己の責任においてアカウント情報を管理するものとします。アカウントの不正利用によって生じた損害について、運営者は一切の責任を負いません。</P>
        </Section>

        <Section title="第4条（本サービスの内容）">
          <P>本サービスは、単語帳の作成、編集、学習、および他ユーザーの単語帳の閲覧・取り込み機能を提供します。運営者は、本サービスの内容を予告なく変更・追加・停止することがあります。</P>
        </Section>

        <Section title="第5条（ユーザーコンテンツ）">
          <P>ユーザーは、本サービスを通じて作成・投稿したコンテンツ（以下「ユーザーコンテンツ」）について、一切の責任を負います。</P>
          <P style={styles.mt}>ユーザーは、以下に該当する内容を投稿してはなりません。</P>
          <Ul items={[
            "法令または公序良俗に反する内容",
            "差別的・攻撃的・暴力的・性的に不適切な内容",
            "他者の権利（著作権・肖像権など）を侵害する内容",
            "虚偽または誤解を招く情報",
            "その他、運営者が不適切と判断する内容",
          ]} />
        </Section>

        <Section title="第6条（公開コンテンツ）">
          <P>ユーザーが公開した単語帳は、他のユーザーに閲覧・利用される場合があります。ユーザーは、公開するコンテンツについて、第三者に不利益を与えないよう配慮するものとします。</P>
          <P style={styles.mt}>運営者は、不適切と判断した公開コンテンツについて、削除または非公開化することができます。</P>
        </Section>

        <Section title="第7条（コンテンツの利用）">
          <P>ユーザーが公開した単語帳は、他ユーザーが自身の学習目的のために取り込むことができます。取り込まれた単語帳は、各ユーザーの環境で複製され、独立して利用されます。</P>
        </Section>

        <Section title="第8条（禁止事項）">
          <P>ユーザーは、以下の行為を行ってはなりません。</P>
          <Ul items={[
            "本サービスの運営を妨害する行為",
            "不正アクセスや不正利用",
            "スパム行為",
            "他ユーザーへの嫌がらせや迷惑行為",
            "本サービスのバグや仕様を悪用する行為",
          ]} />
        </Section>

        <Section title="第9条（サービスの停止）">
          <P>運営者は、以下の場合において、事前の通知なく本サービスの全部または一部を停止できるものとします。</P>
          <Ul items={[
            "システムの保守・更新",
            "不可抗力（災害、障害など）",
            "その他運営上必要と判断した場合",
          ]} />
        </Section>

        <Section title="第10条（免責事項）">
          <P>運営者は、本サービスに事実上または法律上の瑕疵がないことを保証するものではありません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</P>
        </Section>

        <Section title="第11条（規約の変更）">
          <P>運営者は、必要と判断した場合、ユーザーに通知することなく本規約を変更することができます。変更後の規約は、本サービス上に表示した時点で効力を生じるものとします。</P>
        </Section>

        <Section title="第12条（準拠法・管轄）">
          <P>本規約は日本法に準拠します。本サービスに関して紛争が生じた場合、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</P>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>附則：本規約は、2026年◯月◯日より施行します。</Text>
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
