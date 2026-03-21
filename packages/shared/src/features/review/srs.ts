/**
 * SRS（忘却曲線）に基づいて次回復習日を計算する。
 *
 * - 正解: +3日
 * - 不正解: +1日
 */
export function calculateNextReviewDate(isCorrect: boolean): Date {
  const now = new Date()
  now.setDate(now.getDate() + (isCorrect ? 3 : 1))
  return now
}
