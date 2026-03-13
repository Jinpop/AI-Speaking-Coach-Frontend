export const CHAT_AUDIO = {
  recordingMaxSeconds: 15,
  minRecordingSeconds: 1,
  minRecordingBytes: 1024,

  levelBarsCount: 14,
  levelBase: 8,
  levelMin: 8,
  levelMax: 48,
  levelIntensityMin: 0.2,
  levelRmsMultiplier: 6.5,
  levelFallbackBase: 0.35,
  levelFallbackSinDivider: 220,
  levelFallbackSinAmplitude: 0.4,

  analyserFftSize: 512,

  revealWordDelayMs: 80,

  ringRadius: 44,
} as const

export const CHAT_UI = {
  autoScrollThresholdPx: 24,
  aiAudioDataUrlPrefix: 'data:audio/mpeg;base64,',
} as const

