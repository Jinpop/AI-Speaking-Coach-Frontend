import { useEffect, useState } from "react";
import { HOME_CARDS } from "../../../mocks/homeCards";
import { ApiError } from "../../../shared/api/client";
import { getMembershipStatus } from "../../../shared/api/membership";
import { useUserStore } from "../../../shared/store/userStore";
import * as S from "../HomePage.styled";

type MembershipStatusResponse = Awaited<ReturnType<typeof getMembershipStatus>>;

export default function HomePageView() {
  const userId = useUserStore((state) => state.userId);
  const [membership, setMembership] = useState<MembershipStatusResponse | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    const loadMembership = async () => {
      try {
        const response = await getMembershipStatus();
        if (!active) return;
        setMembership(response);
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError) {
          setMembership(null);
        } else {
          setMembership(null);
        }
      }
    };

    loadMembership();
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <S.Page>
      <S.Header>
        <S.Title>Home</S.Title>
        <S.Description>
          원하는 학습 경험을 카드로 골라 시작해 보세요.
        </S.Description>
      </S.Header>
      <S.CardRow>
        {HOME_CARDS.map((card) => {
          const canAccess = Boolean(
            membership && membership[card.requiredCapability],
          );
          return (
            <S.CardLink key={card.title} to={card.href} $disabled={!canAccess}>
              <S.Card $disabled={!canAccess}>
                <S.CardImage src={card.image} alt={card.title} />
                <S.CardBody>
                  <S.Category>{card.category}</S.Category>
                  <S.CardTitle>{card.title}</S.CardTitle>
                  <S.CardDescription>{card.description}</S.CardDescription>
                  <S.CardFooter>
                    <S.CardMeta>{card.meta}</S.CardMeta>
                    {!canAccess && <S.DisabledTag>권한 필요</S.DisabledTag>}
                  </S.CardFooter>
                </S.CardBody>
                {!canAccess && (
                  <S.DisabledOverlay>
                    <S.DisabledText>멤버십을 구독하세요</S.DisabledText>
                  </S.DisabledOverlay>
                )}
              </S.Card>
            </S.CardLink>
          );
        })}
      </S.CardRow>
    </S.Page>
  );
}
