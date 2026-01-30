import type { MembershipPlan } from '../../../shared/api/plans'
import * as S from '../MembershipPage.styled'

type Props = {
  plan: MembershipPlan | null
  submitting: boolean
  onCancel: () => void
  onConfirm: (planId: number) => void
}

export default function MembershipConfirmModal({ plan, submitting, onCancel, onConfirm }: Props) {
  if (!plan) return null

  return (
    <S.ModalOverlay>
      <S.ModalCard>
        <S.ModalHeader>
          <S.ModalTitle>결제 확인</S.ModalTitle>
        </S.ModalHeader>
        <S.ModalBody>
          <S.ModalRow>
            <span>플랜</span>
            <strong>{plan.name.toUpperCase()}</strong>
          </S.ModalRow>
          <S.ModalRow>
            <span>기간</span>
            <strong>{plan.durationDays}일</strong>
          </S.ModalRow>
          <S.ModalRow>
            <span>권한</span>
            <strong>
              {plan.canStudy ? 'Study ' : ''}
              {plan.canChat ? 'Chat ' : ''}
              {plan.canAnalyze ? 'Analyze' : ''}
            </strong>
          </S.ModalRow>
          <S.ModalRow>
            <span>결제 금액</span>
            <strong>정가 공개 예정</strong>
          </S.ModalRow>
        </S.ModalBody>
        <S.ModalActions>
          <S.GhostButton onClick={onCancel}>취소</S.GhostButton>
          <S.PlanCTA
            $featured
            disabled={submitting}
            onClick={() => onConfirm(plan.id)}
          >
            결제 진행
          </S.PlanCTA>
        </S.ModalActions>
      </S.ModalCard>
    </S.ModalOverlay>
  )
}
