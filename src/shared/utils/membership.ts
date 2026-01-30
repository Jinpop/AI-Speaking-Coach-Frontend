export const formatDday = (expiresAt?: string | null) => {
  if (!expiresAt) return '-'
  const expires = new Date(expiresAt)
  if (Number.isNaN(expires.getTime())) return '-'
  const now = new Date()
  const diffMs = expires.getTime() - now.getTime()
  const msPerDay = 1000 * 60 * 60 * 24
  if (diffMs === 0) return 'D-Day'
  if (diffMs > 0) return `D-${Math.ceil(diffMs / msPerDay)}`
  return `D+${Math.abs(Math.floor(diffMs / msPerDay))}`
}

export const membershipTone = (state?: string | null) => {
  if (state === 'premium') return 'active'
  if (state === 'basic') return 'warn'
  return 'neutral'
}
