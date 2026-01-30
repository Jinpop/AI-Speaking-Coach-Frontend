import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { createMembership, getMembershipStatus } from "../../../shared/api/membership";
import { getMembershipPlans } from "../../../shared/api/plans";
import { Toast } from "../../../shared/components/ui";
import { useUserStore } from "../../../shared/store/userStore";
import MembershipConfirmModal from "./MembershipConfirmModal";
import MembershipCurrentSection from "./MembershipCurrentSection";
import MembershipPlansSection from "./MembershipPlansSection";
import * as S from "../MembershipPage.styled";

type MembershipStatusResponse = Awaited<ReturnType<typeof getMembershipStatus>>;
type MembershipPlansResponse = Awaited<ReturnType<typeof getMembershipPlans>>;

export default function MembershipPageView() {
  const [membership, setMembership] = useState<MembershipStatusResponse | null>(
    null,
  );
  const [plans, setPlans] = useState<MembershipPlansResponse["plans"]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [submittingPlanId, setSubmittingPlanId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMembershipStatus();
      setMembership(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("멤버십 정보를 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembership();
  }, [loadMembership, userId]);

  useEffect(() => {
    let active = true;
    const loadPlans = async () => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const response = await getMembershipPlans();
        if (!active) return;
        setPlans(response.plans);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError) {
          setPlansError(err.message);
        } else {
          setPlansError("멤버십 플랜을 불러오지 못했습니다.");
        }
      } finally {
        if (active) setPlansLoading(false);
      }
    };

    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const featuredTier = useMemo(() => {
    if (!plans.length) return null;
    return Math.max(...plans.map((plan) => plan.tier));
  }, [plans]);

  const maxDuration = useMemo(() => {
    if (!plans.length) return null;
    return Math.max(...plans.map((plan) => plan.durationDays));
  }, [plans]);

  const currentPlanId = membership?.plan?.id ?? null;
  const currentTier = membership?.plan?.tier ?? null;

  const handleSubscribe = async (planId: number, disabled: boolean) => {
    if (disabled || submittingPlanId) return;
    setSubscribeError(null);
    setSubmittingPlanId(planId);
    try {
      await createMembership(planId);
      await loadMembership();
      setToast({ message: "구독이 완료되었습니다.", tone: "success" });
    } catch (err) {
      if (err instanceof ApiError) {
        setSubscribeError(err.message);
        setToast({ message: err.message, tone: "error" });
      } else {
        setSubscribeError("구독 요청에 실패했습니다.");
        setToast({ message: "구독 요청에 실패했습니다.", tone: "error" });
      }
    } finally {
      setSubmittingPlanId(null);
    }
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  return (
    <S.Container>
      <S.Title>Membership</S.Title>
      {error && <S.Error role="alert">{error}</S.Error>}
      {plansError && <S.Error role="alert">{plansError}</S.Error>}
      {subscribeError && <S.Error role="alert">{subscribeError}</S.Error>}
      {toast && <Toast $tone={toast.tone}>{toast.message}</Toast>}
      <MembershipPlansSection
        plans={plans}
        plansLoading={plansLoading}
        membership={membership}
        featuredTier={featuredTier}
        maxDuration={maxDuration}
        currentPlanId={currentPlanId}
        currentTier={currentTier}
        submittingPlanId={submittingPlanId}
        onSelectPlan={(planId) => setSelectedPlanId(planId)}
      />

      <MembershipCurrentSection loading={loading} membership={membership} />

      <MembershipConfirmModal
        plan={selectedPlan}
        submitting={submittingPlanId !== null}
        onCancel={() => setSelectedPlanId(null)}
        onConfirm={(planId) => {
          handleSubscribe(planId, false)
          setSelectedPlanId(null)
        }}
      />
    </S.Container>
  )
}
