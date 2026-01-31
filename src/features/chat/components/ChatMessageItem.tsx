import { useEffect, useRef, useState } from 'react'
import * as S from '../ChatPage.styled'

type Props = {
  role: 'ai' | 'user'
  text: string
  audioUrl?: string | null
  isPlaying?: boolean
  onPlay?: () => void
  isPending?: boolean
  isAudioLoading?: boolean
}

export default function ChatMessageItem({
  role,
  text,
  audioUrl,
  isPlaying,
  onPlay,
  isPending,
  isAudioLoading,
}: Props) {
  const [visibleText, setVisibleText] = useState(text)
  const revealTimerRef = useRef<number | null>(null)
  const revealedCountRef = useRef(0)

  useEffect(() => {
    if (role !== 'ai') {
      setVisibleText(text)
      return
    }
    const words = text.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      setVisibleText('')
      revealedCountRef.current = 0
      return
    }
    if (words.length <= revealedCountRef.current) {
      setVisibleText(text)
      return
    }

    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }

    const step = () => {
      const nextCount = Math.min(words.length, revealedCountRef.current + 1)
      revealedCountRef.current = nextCount
      setVisibleText(words.slice(0, nextCount).join(' '))
      if (nextCount < words.length) {
        revealTimerRef.current = window.setTimeout(step, 80)
      }
    }

    step()

    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
    }
  }, [role, text])

  return (
    <S.MessageRow $role={role}>
      {role === 'ai' && <S.Avatar>AI</S.Avatar>}
      <S.Bubble $role={role}>
        {isPending && !text ? (
          <S.TypingDots aria-label="AI가 답변을 작성 중입니다">
            <span />
            <span />
            <span />
          </S.TypingDots>
        ) : (
          visibleText
        )}
        {role === 'ai' && isAudioLoading && (
          <S.LoadingRow aria-live="polite">
            <S.LoadingIcon aria-hidden="true" />
            <span>음성 로딩중...</span>
          </S.LoadingRow>
        )}
        {audioUrl && onPlay && (
          <S.AudioRow>
            <S.AudioButton $playing={isPlaying} onClick={onPlay} aria-label="음성 재생">
              {isPlaying ? (
                <S.PauseIcon viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
                </S.PauseIcon>
              ) : (
                <S.AudioIcon viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                </S.AudioIcon>
              )}
            </S.AudioButton>
            <S.AudioMeta>{role === 'ai' ? 'AI 음성' : '내 음성'}</S.AudioMeta>
          </S.AudioRow>
        )}
      </S.Bubble>
    </S.MessageRow>
  )
}
