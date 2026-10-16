export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function toYearMonth(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

export function formatDateTimeLocal(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(iso.replace(/-/g, '/'))
  if (Number.isNaN(d.getTime())) return iso
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function isSameMonth(iso: string, yearMonth: string): boolean {
  const d = new Date(iso.replace(/-/g, '/'))
  if (Number.isNaN(d.getTime())) return false
  return toYearMonth(d) === yearMonth
}

export function startOfMonth(yearMonth: string): Date {
  const [y, m] = yearMonth.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

export function shiftMonth(yearMonth: string, delta: number): string {
  const d = startOfMonth(yearMonth)
  d.setMonth(d.getMonth() + delta)
  return toYearMonth(d)
}
