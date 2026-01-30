import type { MembershipPlan } from '../../../shared/api/plans'
import type { MembershipStatusResponse } from '../../../shared/api/membership'
import * as S from '../MembershipPage.styled'

type Props = {
  plans: MembershipPlan[]
  plansLoading: boolean
  membership: MembershipStatusResponse | null
  featuredTier: number | null
  maxDuration: number | null
  currentPlanId: number | null
  currentTier: number | null
  submittingPlanId: number | null
  onSelectPlan: (planId: number) => void
}

export default function MembershipPlansSection({
  plans,
  plansLoading,
  membership,
  featuredTier,
  maxDuration,
  currentPlanId,
  currentTier,
  submittingPlanId,
  onSelectPlan,
}: Props) {
  return (
    <S.PlansSection>
      <S.SectionTitle>Plans</S.SectionTitle>
      {plansLoading ? (
        <S.Muted>플랜을 불러오는 중...</S.Muted>
      ) : plans.length ? (
        <S.PlanGrid>
          {plans.map((plan) => {
            const weeks = Math.round(plan.durationDays / 7)
            const isFeatured = featuredTier !== null && plan.tier === featuredTier
            const isLongest = maxDuration !== null && plan.durationDays === maxDuration
            const badgeTone = isLongest ? 'emerald' : 'indigo'
            const badgeLabel = isLongest ? '최장' : isFeatured ? '인기' : null
            const isCurrent = currentPlanId === plan.id
            const isDowngrade =
              currentTier !== null && plan.tier < currentTier && membership?.state !== 'none'
            const isSubmitting = submittingPlanId === plan.id
            const isDisabled = isCurrent || isDowngrade || isSubmitting
            const ctaLabel = isSubmitting
              ? '처리중...'
              : isCurrent
                ? '구독중'
                : isDowngrade
                  ? '구독 불가'
                  : membership?.state && membership.state !== 'none'
                    ? '업그레이드'
                    : '구독하기'

            return (
              <S.PlanCard key={plan.id} $featured={isFeatured}>
                {badgeLabel && <S.PlanBadge $tone={badgeTone}>{badgeLabel}</S.PlanBadge>}
                <S.PlanHeader>
                  <S.PlanName>{weeks}주 패키지</S.PlanName>
                  <S.PlanDuration>수강기간 {plan.durationDays}일</S.PlanDuration>
                </S.PlanHeader>
                <S.PlanMeta>
                  <S.PriceHint>정가 공개 예정</S.PriceHint>
                  <S.PriceRow>
                    <S.Discount>혜택</S.Discount>
                    <S.Price>{plan.name.toUpperCase()}</S.Price>
                  </S.PriceRow>
                </S.PlanMeta>
                <S.PlanFeatureList>
                  <S.FeatureItem>
                    <S.FeatureLabel>AI 튜터</S.FeatureLabel>
                    <S.FeatureValue>{plan.canStudy ? '포함' : '미포함'}</S.FeatureValue>
                  </S.FeatureItem>
                  <S.FeatureItem>
                    <S.FeatureLabel>Chat</S.FeatureLabel>
                    <S.FeatureValue>{plan.canChat ? '포함' : '불가'}</S.FeatureValue>
                  </S.FeatureItem>
                  <S.FeatureItem>
                    <S.FeatureLabel>Analyze</S.FeatureLabel>
                    <S.FeatureValue>{plan.canAnalyze ? '포함' : '불가'}</S.FeatureValue>
                  </S.FeatureItem>
                </S.PlanFeatureList>
                <S.PlanCTA
                  $featured={isFeatured}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return
                    onSelectPlan(plan.id)
                  }}
                >
                  {ctaLabel}
                </S.PlanCTA>
              </S.PlanCard>
            )
          })}
        </S.PlanGrid>
      ) : (
        <S.Muted>등록된 플랜이 없습니다.</S.Muted>
      )}
    </S.PlansSection>
  )
}
