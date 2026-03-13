import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import introTts from '../../../assets/intro_tts.mp3'
import { CHAT_AUDIO } from '../constants'
import { formatTime } from '../utils/audioProcessing'

type RecordingStatus = 'idle' | 'recording' | 'finished'

type UseChatAudioOptions = {
  // 녹음이 종료되어 Blob이 준비되면 호출(상위 컴포넌트에서 전송 등 후속 작업에 사용)
  onRecordReady?: (blob: Blob) => void
}

export const useChatAudio = ({ onRecordReady }: UseChatAudioOptions) => {
  // 상태 머신: idle(대기) → recording(녹음 중) → finished(녹음 완료/재생 가능)
  const [status, setStatus] = useState<RecordingStatus>('idle')
  // 녹음 남은 시간(초). 최대 15초 카운트다운
  const [secondsLeft, setSecondsLeft] = useState(CHAT_AUDIO.recordingMaxSeconds)
  // 마이크 입력 레벨을 시각화하기 위한 막대 높이 배열(VoiceRecorderPanel에서 사용)
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: CHAT_AUDIO.levelBarsCount }, () => CHAT_AUDIO.levelBase),
  )
  // 녹음된 오디오를 재생하기 위한 object URL
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  // 녹음 미리듣기 재생 중 여부
  const [isPlaying, setIsPlaying] = useState(false)
  // 인트로(고정 TTS) 재생 중 여부
  const [isAiPlaying, setIsAiPlaying] = useState(false)
  // getUserMedia 연결 중(권한 요청/장치 연결 지연) 여부
  const [isConnecting, setIsConnecting] = useState(false)
  // 미리듣기 재생 진행 시간/총 길이(초)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  // 녹음 관련 에러(권한/지원 여부 등) 메시지
  const [recordError, setRecordError] = useState<string | null>(null)

  // MediaRecorder/스트림/분석기 등은 렌더와 무관한 외부 리소스라 ref로 보관
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const aiAudioRef = useRef<HTMLAudioElement | null>(null)

  // 녹음 종료 + 마이크/오디오 리소스 해제
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

  // 미리듣기 재생 중단(정지/되감기)
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setPlaybackTime(0)
  }, [])

  // 인트로(TTS) 재생 중단
  const stopAiPlayback = useCallback(() => {
    if (aiAudioRef.current) {
      aiAudioRef.current.pause()
      aiAudioRef.current.currentTime = 0
    }
    setIsAiPlaying(false)
  }, [])

  useEffect(() => {
    // 녹음 중일 때 1초마다 카운트다운. 0이 되면 자동으로 녹음 종료 → finished
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
    // 녹음 중일 때 마이크 입력 레벨을 계산해서 시각화(levels) 업데이트
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
        intensity = Math.min(
          1,
          Math.max(CHAT_AUDIO.levelIntensityMin, rms * CHAT_AUDIO.levelRmsMultiplier),
        )
      } else {
        intensity =
          CHAT_AUDIO.levelFallbackBase +
          Math.abs(Math.sin(performance.now() / CHAT_AUDIO.levelFallbackSinDivider)) *
            CHAT_AUDIO.levelFallbackSinAmplitude
      }
      const min = CHAT_AUDIO.levelMin
      const max = CHAT_AUDIO.levelMax
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

  // 마이크 권한 요청 → 녹음 시작 → stop 시 Blob 생성 및 object URL/콜백 처리
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
    setSecondsLeft(CHAT_AUDIO.recordingMaxSeconds)
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
          // 녹음 종료 시점에 chunks를 합쳐 최종 Blob 생성
          const blob = new Blob(chunks, { type: 'audio/webm' })
          // 미리듣기 재생을 위해 object URL 생성
          setAudioUrl(URL.createObjectURL(blob))
          // 상위(페이지)로 Blob 전달 (STT/전송 등에 사용)
          onRecordReady?.(blob)
        })

        // WebAudio analyser로 실시간 레벨 측정(시각화)
        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          void audioContext.resume()
        }
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = CHAT_AUDIO.analyserFftSize
        analyserRef.current = analyser
        source.connect(analyser)
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

        mediaRecorder.start()
      })
      .catch(() => {
        // 권한 거부/장치 오류 등
        setRecordError('마이크 권한이 필요합니다.')
        setIsConnecting(false)
        setStatus('idle')
      })
  }, [onRecordReady, stopAiPlayback, stopPlayback])

  // 사용자가 버튼으로 녹음을 멈춘 경우(자동 타이머 종료와 구분)
  const stopRecordingManually = useCallback(() => {
    stopRecording()
    setIsConnecting(false)
    setStatus('finished')
  }, [stopRecording])

  // 녹음/재생 상태를 초기 상태로 되돌림 + object URL 정리
  const resetRecording = useCallback(() => {
    setStatus('idle')
    setSecondsLeft(CHAT_AUDIO.recordingMaxSeconds)
    setLevels(Array.from({ length: CHAT_AUDIO.levelBarsCount }, () => CHAT_AUDIO.levelBase))
    setRecordError(null)
    setIsConnecting(false)
    stopAiPlayback()
    stopPlayback()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
  }, [audioUrl, stopAiPlayback, stopPlayback])

  // 녹음 미리듣기 재생 토글
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

  // AI 인트로 오디오(로컬 mp3) 재생 토글
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
    // audioUrl이 준비되면 Audio를 만들고 재생 상태(시간/종료)를 state로 동기화
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
      // unmount 시 외부 리소스 정리
      stopRecording()
      stopPlayback()
      stopAiPlayback()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl, stopAiPlayback, stopPlayback, stopRecording])

  const formattedTimer = useMemo(() => {
    // 녹음 중: 00:SS 카운트다운 / finished: 재생 시간 표시
    if (status === 'finished') {
      return `${formatTime(playbackTime)} / ${formatTime(playbackDuration)}`
    }
    return `00:${String(
      status === 'recording' ? secondsLeft : CHAT_AUDIO.recordingMaxSeconds,
    ).padStart(2, '0')}`
  }, [playbackDuration, playbackTime, secondsLeft, status])

  const displayHint = useMemo(() => {
    // 녹음 완료 후엔 힌트 비움(상위에서 에러/안내를 별도로 보여줌)
    if (status === 'finished') {
      return ''
    }
    return recordError ?? ''
  }, [recordError, status])

  const ring = useMemo(() => {
    // 원형 프로그레스(녹음 진행/재생 진행)에 필요한 값들
    const radius = CHAT_AUDIO.ringRadius
    const circumference = 2 * Math.PI * radius
    const progress =
      status === 'recording'
        ? secondsLeft / CHAT_AUDIO.recordingMaxSeconds
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
