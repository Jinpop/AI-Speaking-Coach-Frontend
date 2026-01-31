import * as S from '../ChatPage.styled'

type Props = {
  isRecording: boolean
  formattedTimer: string
  displayHint: string
  ring: {
    radius: number
    circumference: number
    offset: number
  }
  levels: number[]
  status: 'idle' | 'recording' | 'finished'
  micDisabled: boolean
  isConnecting: boolean
  canSend: boolean
  isSending: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onPlay: () => void
  onSend: () => void
}

export default function VoiceRecorderPanel({
  isRecording,
  formattedTimer,
  displayHint,
  ring,
  levels,
  status,
  micDisabled,
  isConnecting,
  canSend,
  isSending,
  onStart,
  onStop,
  onReset,
  onPlay,
  onSend,
}: Props) {
  return (
    <S.VoicePanel>
      <S.VoiceHeader>
        <S.VoiceTitle>
          {isConnecting ? '마이크 연동중...' : isRecording ? '음성 인식 중...' : '마이크로 말해보세요'}
        </S.VoiceTitle>
      </S.VoiceHeader>
      <S.MicCenter>
        <S.MicWrap>
          <S.TimerRing width="96" height="96" viewBox="0 0 96 96">
            <S.RingTrack cx="48" cy="48" r={ring.radius} />
            <S.RingProgress
              cx="48"
              cy="48"
              r={ring.radius}
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.offset}
            />
          </S.TimerRing>
          <S.MicCircle
            $recording={isRecording}
            onClick={status === 'finished' ? onPlay : isRecording ? onStop : onStart}
            disabled={micDisabled}
            type="button"
          >
            {status === 'finished' ? (
              <S.PlayIcon viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5-10-6.5Z" />
              </S.PlayIcon>
            ) : (
              <S.MicIcon viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V20H9v2h6v-2h-2v-2.08A7 7 0 0 0 19 11h-2Z" />
              </S.MicIcon>
            )}
          </S.MicCircle>
        </S.MicWrap>
      </S.MicCenter>
      <S.Timer $recording={isRecording}>{formattedTimer}</S.Timer>
      <S.VoiceHint>{displayHint}</S.VoiceHint>
      {isRecording && (
        <S.LevelRow>
          {levels.map((height, index) => (
            <S.LevelBar key={index} $height={height} $active={isRecording} />
          ))}
        </S.LevelRow>
      )}
      {status === 'finished' ? (
        <S.ButtonRow>
          <S.PrimaryButton onClick={onSend} disabled={!canSend || isSending}>
            {isSending ? '전송중...' : '보내기'}
          </S.PrimaryButton>
          <S.SecondaryButton onClick={onReset}>다시 녹음하기</S.SecondaryButton>
        </S.ButtonRow>
      ) : null}
    </S.VoicePanel>
  )
}
