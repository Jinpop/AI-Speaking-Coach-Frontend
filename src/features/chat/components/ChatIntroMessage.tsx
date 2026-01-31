import * as S from "../ChatPage.styled";

type Props = {
  isPlaying: boolean;
  onPlay: () => void;
};

export default function ChatIntroMessage({ isPlaying, onPlay }: Props) {
  return (
    <S.MessageRow $role="ai">
      <S.Avatar>AI</S.Avatar>
      <S.Bubble $role="ai">
        Hello! Today, we’re going to focus on how to introduce yourself well.
        <br />
        First, it helps to start with a clean three sentence structure. <br />
        Could you give a 3 to 4 sentence self introduction that fits your
        current situation?
        <S.AudioRow>
          <S.AudioButton
            $playing={isPlaying}
            onClick={onPlay}
            aria-label="AI 음성 재생"
          >
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
  );
}
