export const metadata = {
  title: "プライバシーポリシー | memorizar",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="mb-8 text-sm text-gray-500">最終更新日：2026年◯月◯日</p>

        <p className="mb-8 text-sm leading-relaxed text-gray-700">
          本プライバシーポリシー（以下「本ポリシー」）は、当アプリ（以下「本サービス」）における個人情報の取り扱いについて定めるものです。
        </p>

        <Section title="第1条（収集する情報）">
          <p>本サービスでは、以下の情報を収集します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>メールアドレス（アカウント登録・認証に使用）</li>
            <li>表示名（任意。プロフィール表示に使用）</li>
            <li>ユーザーが作成・登録した単語帳およびカードのデータ</li>
            <li>学習履歴・正答率などの学習データ</li>
          </ul>
        </Section>

        <Section title="第2条（情報の利用目的）">
          <p>収集した情報は、以下の目的にのみ使用します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>アカウントの認証・管理</li>
            <li>学習機能の提供および学習進捗の表示</li>
            <li>サービスの改善・不具合対応</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </Section>

        <Section title="第3条（第三者への提供）">
          運営者は、以下のいずれかに該当する場合を除き、ユーザーの個人情報を第三者に提供しません。
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護のために必要な場合</li>
          </ul>
        </Section>

        <Section title="第4条（データの保存・管理）">
          収集した情報は、適切なセキュリティ対策を講じたサーバー上に保存します。運営者は、不正アクセス・紛失・漏洩の防止に努めますが、完全な安全性を保証するものではありません。
        </Section>

        <Section title="第5条（データの保持期間）">
          ユーザーのデータは、アカウントが有効である間保持されます。アカウントを削除した場合、関連するデータは合理的な期間内に削除されます。
        </Section>

        <Section title="第6条（ユーザーの権利）">
          <p>ユーザーは、自己の個人情報について以下の権利を有します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>開示・確認の請求</li>
            <li>訂正・削除の請求</li>
            <li>利用停止の請求</li>
          </ul>
          <p className="mt-3">これらの請求は、本サービス内のお問い合わせ手段を通じて行うことができます。</p>
        </Section>

        <Section title="第7条（Cookieおよびトークン）">
          本サービスでは、認証のために認証トークンを端末のセキュアストレージに保存します。これはサービスの提供に必要なものであり、広告目的での使用は行いません。
        </Section>

        <Section title="第8条（外部サービス）">
          本サービスは現在、広告配信・アクセス解析等の外部トラッキングサービスを使用していません。将来的に導入する場合は、本ポリシーを更新してお知らせします。
        </Section>

        <Section title="第9条（未成年者の利用）">
          本サービスは年齢制限を設けていませんが、未成年者が利用する場合は保護者の同意のもとで利用してください。
        </Section>

        <Section title="第10条（ポリシーの変更）">
          運営者は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせします。変更後のポリシーは、掲載した時点で効力を生じます。
        </Section>

        <Section title="第11条（準拠法・管轄）">
          本ポリシーは日本法に準拠します。本ポリシーに関して紛争が生じた場合、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
        </Section>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">附則：本ポリシーは、2026年◯月◯日より施行します。</p>
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
