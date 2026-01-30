import type { MembershipStatusResponse } from '../../../shared/api/membership'
import { formatDday, membershipTone } from '../../../shared/utils/membership'
import * as S from '../MembershipPage.styled'

type Props = {
  loading: boolean
  membership: MembershipStatusResponse | null
}

export default function MembershipCurrentSection({ loading, membership }: Props) {
  return (
    <S.CurrentSection>
      <S.CurrentTitle>현재 구독 상태</S.CurrentTitle>
      {loading && !membership ? (
        <S.Muted>불러오는 중...</S.Muted>
      ) : membership ? (
        <>
          <S.CurrentRow>
            <S.StatusPill $tone={membershipTone(membership.state)}>
              {membership.state}
            </S.StatusPill>
            <S.Dday>{formatDday(membership.expiresAt)}</S.Dday>
          </S.CurrentRow>
          <S.FlagList>
            <S.Flag $enabled={membership.canStudy}>AI 튜터</S.Flag>
            <S.Flag $enabled={membership.canChat}>Chat</S.Flag>
            <S.Flag $enabled={membership.canAnalyze}>Analyze</S.Flag>
          </S.FlagList>
        </>
      ) : (
        <S.Muted>멤버십 정보를 확인할 수 없습니다.</S.Muted>
      )}
    </S.CurrentSection>
  )
}
