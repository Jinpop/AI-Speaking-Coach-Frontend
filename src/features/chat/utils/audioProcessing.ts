export const formatTime = (value: number) => {
  const clamped = Math.max(0, Math.floor(value))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
