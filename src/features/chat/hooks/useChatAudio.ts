import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import introTts from '../../../assets/intro_tts.mp3'
import { formatTime } from '../utils/audioProcessing'

type RecordingStatus = 'idle' | 'recording' | 'finished'

type UseChatAudioOptions = {
  onRecordReady?: (blob: Blob) => void
}

export const useChatAudio = ({ onRecordReady }: UseChatAudioOptions) => {
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [secondsLeft, setSecondsLeft] = useState(15)
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 14 }, () => 8))
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAiPlaying, setIsAiPlaying] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [recordError, setRecordError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const aiAudioRef = useRef<HTMLAudioElement | null>(null)

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setPlaybackTime(0)
  }, [])

  const stopAiPlayback = useCallback(() => {
    if (aiAudioRef.current) {
      aiAudioRef.current.pause()
      aiAudioRef.current.currentTime = 0
    }
    setIsAiPlaying(false)
  }, [])

  useEffect(() => {
    if (status !== 'recording') return
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopRecording()
          setStatus('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [status, secondsLeft, stopRecording])

  useEffect(() => {
    if (status !== 'recording') return
    const tick = () => {
      const analyser = analyserRef.current
      const dataArray = dataArrayRef.current
      let intensity = 0.2
      if (analyser && dataArray) {
        analyser.getByteTimeDomainData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i += 1) {
          const value = (dataArray[i] - 128) / 128
          sum += value * value
        }
        const rms = Math.sqrt(sum / dataArray.length)
        intensity = Math.min(1, Math.max(0.2, rms * 6.5))
      } else {
        intensity = 0.35 + Math.abs(Math.sin(performance.now() / 220)) * 0.4
      }
      const min = 8
      const max = 48
      setLevels((prev) =>
        prev.map((_, index) => {
          const variance = 0.65 + (index % 4) * 0.12
          return Math.round(min + (max - min) * intensity * variance)
        }),
      )
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [status])

  const startRecording = useCallback(() => {
    setRecordError(null)
    stopAiPlayback()
    stopPlayback()
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError('이 브라우저에서는 마이크 접근을 지원하지 않습니다.')
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      setRecordError('이 브라우저에서는 녹음을 지원하지 않습니다.')
      return
    }
    setSecondsLeft(15)
    setStatus('recording')
    setIsConnecting(true)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsConnecting(false)
        mediaStreamRef.current = stream
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        mediaRecorderRef.current = mediaRecorder
        const chunks: BlobPart[] = []

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        })
        mediaRecorder.addEventListener('stop', () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          setAudioUrl(URL.createObjectURL(blob))
          onRecordReady?.(blob)
        })

        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          void audioContext.resume()
        }
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        analyserRef.current = analyser
        source.connect(analyser)
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

        mediaRecorder.start()
      })
      .catch(() => {
        setRecordError('마이크 권한이 필요합니다.')
        setIsConnecting(false)
        setStatus('idle')
      })
  }, [onRecordReady, stopAiPlayback, stopPlayback])

  const stopRecordingManually = useCallback(() => {
    stopRecording()
    setIsConnecting(false)
    setStatus('finished')
  }, [stopRecording])

  const resetRecording = useCallback(() => {
    setStatus('idle')
    setSecondsLeft(15)
    setLevels(Array.from({ length: 14 }, () => 8))
    setRecordError(null)
    setIsConnecting(false)
    stopAiPlayback()
    stopPlayback()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
  }, [audioUrl, stopAiPlayback, stopPlayback])

  const playRecording = useCallback(() => {
    if (!audioUrl) return
    if (isPlaying) {
      stopPlayback()
      return
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
    }
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
  }, [audioUrl, isPlaying, stopPlayback])

  const playAiIntro = useCallback(() => {
    if (!aiAudioRef.current) {
      aiAudioRef.current = new Audio(introTts)
      aiAudioRef.current.addEventListener('ended', () => {
        setIsAiPlaying(false)
      })
    }
    if (isAiPlaying) {
      stopAiPlayback()
      return
    }
    aiAudioRef.current
      .play()
      .then(() => setIsAiPlaying(true))
      .catch(() => setIsAiPlaying(false))
  }, [isAiPlaying, stopAiPlayback])

  useEffect(() => {
    const audio = audioUrl ? new Audio(audioUrl) : null
    if (!audio) return
    audioRef.current = audio
    const handleLoaded = () => {
      setPlaybackDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleTime = () => {
      setPlaybackTime(audio.currentTime)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setPlaybackTime(audio.duration || 0)
    }
    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('timeupdate', handleTime)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('timeupdate', handleTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      stopRecording()
      stopPlayback()
      stopAiPlayback()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl, stopAiPlayback, stopPlayback, stopRecording])

  const formattedTimer = useMemo(() => {
    if (status === 'finished') {
      return `${formatTime(playbackTime)} / ${formatTime(playbackDuration)}`
    }
    return `00:${String(status === 'recording' ? secondsLeft : 15).padStart(2, '0')}`
  }, [playbackDuration, playbackTime, secondsLeft, status])

  const displayHint = useMemo(() => {
    if (status === 'finished') {
      return ''
    }
    return recordError ?? ''
  }, [recordError, status])

  const ring = useMemo(() => {
    const radius = 44
    const circumference = 2 * Math.PI * radius
    const progress =
      status === 'recording'
        ? secondsLeft / 15
        : playbackDuration > 0
          ? playbackTime / playbackDuration
          : 0
    return {
      radius,
      circumference,
      offset: circumference * (1 - progress),
    }
  }, [playbackDuration, playbackTime, secondsLeft, status])

  return {
    status,
    isRecording: status === 'recording',
    isConnecting,
    isAiPlaying,
    isPlaying,
    audioUrl,
    formattedTimer,
    displayHint,
    ring,
    levels,
    startRecording,
    stopRecording: stopRecordingManually,
    resetRecording,
    playRecording,
    playAiIntro,
    stopAiPlayback,
  }
}

export type UseChatAudioReturn = ReturnType<typeof useChatAudio>
