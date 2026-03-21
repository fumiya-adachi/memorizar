/**
 * インポート済みデッキのカード枚数を計算する。
 *
 * - 元デッキのカード数をベースに、上書き（コピー）カードが重複カウントされないよう補正する。
 * - ローカル追加カード（sourceCardId = null）はそのまま加算する。
 *
 * @param sourceCardCount  元デッキのカード数
 * @param localCardCount   このデッキ固有のカード数（上書き含む）
 * @param overrideCount    上書きカード数（sourceCardId が存在するもの）
 */
export function calcImportedDeckCardCount(
  sourceCardCount: number,
  localCardCount: number,
  overrideCount: number,
): number {
  return Math.max(0, sourceCardCount + localCardCount - overrideCount)
}
