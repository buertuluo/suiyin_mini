/** 金额：库内用分，展示用元 */

export function fenToYuan(fen: number): string {
  const sign = fen < 0 ? '-' : ''
  const abs = Math.abs(fen)
  const yuan = Math.floor(abs / 100)
  const rem = abs % 100
  return `${sign}${yuan}.${String(rem).padStart(2, '0')}`
}

export function formatYuan(fen: number, withSign = false): string {
  const text = fenToYuan(fen)
  if (!withSign) return text
  if (fen > 0) return `+${text}`
  return text
}

/** 将用户输入的元字符串转为分，非法返回 null */
export function yuanInputToFen(input: string): number | null {
  const raw = input.trim().replace(/￥|,/g, '')
  if (!raw || !/^\d+(\.\d{0,2})?$/.test(raw)) return null
  const [intPart, decPart = ''] = raw.split('.')
  const fen = Number(intPart) * 100 + Number((decPart + '00').slice(0, 2))
  if (!Number.isFinite(fen) || fen < 0) return null
  return fen
}
