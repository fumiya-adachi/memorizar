export const metadata = {
  title: "利用規約 | memorizar",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">利用規約</h1>
        <p className="mb-8 text-sm text-gray-500">最終更新日：2026年◯月◯日</p>

        <p className="mb-8 text-sm leading-relaxed text-gray-700">
          本利用規約（以下「本規約」）は、当アプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
        </p>

        <Section title="第1条（適用）">
          本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。
        </Section>

        <Section title="第2条（利用登録）">
          ユーザーは、本規約に同意の上、所定の方法により登録を行うことで、本サービスを利用できます。
        </Section>

        <Section title="第3条（アカウント管理）">
          ユーザーは、自己の責任においてアカウント情報を管理するものとします。
          アカウントの不正利用によって生じた損害について、運営者は一切の責任を負いません。
        </Section>

        <Section title="第4条（本サービスの内容）">
          本サービスは、単語帳の作成、編集、学習、および他ユーザーの単語帳の閲覧・取り込み機能を提供します。
          運営者は、本サービスの内容を予告なく変更・追加・停止することがあります。
        </Section>

        <Section title="第5条（ユーザーコンテンツ）">
          <p>ユーザーは、本サービスを通じて作成・投稿したコンテンツ（以下「ユーザーコンテンツ」）について、一切の責任を負います。</p>
          <p className="mt-3">ユーザーは、以下に該当する内容を投稿してはなりません。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>法令または公序良俗に反する内容</li>
            <li>差別的・攻撃的・暴力的・性的に不適切な内容</li>
            <li>他者の権利（著作権・肖像権など）を侵害する内容</li>
            <li>虚偽または誤解を招く情報</li>
            <li>その他、運営者が不適切と判断する内容</li>
          </ul>
        </Section>

        <Section title="第6条（公開コンテンツ）">
          <p>ユーザーが公開した単語帳は、他のユーザーに閲覧・利用される場合があります。ユーザーは、公開するコンテンツについて、第三者に不利益を与えないよう配慮するものとします。</p>
          <p className="mt-3">運営者は、不適切と判断した公開コンテンツについて、削除または非公開化することができます。</p>
        </Section>

        <Section title="第7条（コンテンツの利用）">
          ユーザーが公開した単語帳は、他ユーザーが自身の学習目的のために取り込むことができます。取り込まれた単語帳は、各ユーザーの環境で複製され、独立して利用されます。
        </Section>

        <Section title="第8条（禁止事項）">
          <p>ユーザーは、以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセスや不正利用</li>
            <li>スパム行為</li>
            <li>他ユーザーへの嫌がらせや迷惑行為</li>
            <li>本サービスのバグや仕様を悪用する行為</li>
          </ul>
        </Section>

        <Section title="第9条（サービスの停止）">
          <p>運営者は、以下の場合において、事前の通知なく本サービスの全部または一部を停止できるものとします。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>システムの保守・更新</li>
            <li>不可抗力（災害、障害など）</li>
            <li>その他運営上必要と判断した場合</li>
          </ul>
        </Section>

        <Section title="第10条（免責事項）">
          運営者は、本サービスに事実上または法律上の瑕疵がないことを保証するものではありません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
        </Section>

        <Section title="第11条（規約の変更）">
          運営者は、必要と判断した場合、ユーザーに通知することなく本規約を変更することができます。変更後の規約は、本サービス上に表示した時点で効力を生じるものとします。
        </Section>

        <Section title="第12条（準拠法・管轄）">
          本規約は日本法に準拠します。本サービスに関して紛争が生じた場合、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
        </Section>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">附則：本規約は、2026年◯月◯日より施行します。</p>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-700">{children}</div>
    </section>
  )
}
