import * as S from '../ChatPage.styled'

type Props = {
  role: 'ai' | 'user'
  text: string
  audioUrl?: string | null
  isPlaying?: boolean
  onPlay?: () => void
}

export default function ChatMessageItem({ role, text, audioUrl, isPlaying, onPlay }: Props) {
  return (
    <S.MessageRow $role={role}>
      {role === 'ai' && <S.Avatar>AI</S.Avatar>}
      <S.Bubble $role={role}>
        {text}
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
