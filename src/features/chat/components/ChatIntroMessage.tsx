import * as S from '../ChatPage.styled'

type Props = {
  isPlaying: boolean
  onPlay: () => void
}

export default function ChatIntroMessage({ isPlaying, onPlay }: Props) {
  return (
    <S.MessageRow $role="ai">
      <S.Avatar>AI</S.Avatar>
      <S.Bubble $role="ai">
        안녕하세요! 오늘은 “자기소개를 잘 하는 법”에 집중해 볼게요. <br />
        먼저, 자기소개는 3문장 구조로 깔끔하게 시작하는 게 좋아요. <br />
        지금 상황에 맞는 자기소개를 3~4문장으로 적어볼까요?
        <S.AudioRow>
          <S.AudioButton $playing={isPlaying} onClick={onPlay} aria-label="AI 음성 재생">
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
          <S.AudioMeta>AI 음성</S.AudioMeta>
        </S.AudioRow>
      </S.Bubble>
    </S.MessageRow>
  )
}
