import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { getMe } from "../../../shared/api/me";
import { getMembershipStatus } from "../../../shared/api/membership";
import { useUserStore } from "../../../shared/store/userStore";
import { formatDday, membershipTone } from "../../../shared/utils/membership";
import * as S from "../MyPage.styled";

type MeResponse = Awaited<ReturnType<typeof getMe>>;
type MembershipStatusResponse = Awaited<ReturnType<typeof getMembershipStatus>>;

export default function MyPageView() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [membership, setMembership] = useState<MembershipStatusResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [meResponse, membershipResponse] = await Promise.all([
          getMe(),
          getMembershipStatus(),
        ]);
        if (!active) return;
        setMe(meResponse);
        setMembership(membershipResponse);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("정보를 불러오지 못했습니다.");
        }
        setMe(null);
        setMembership(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <S.Container>
      <S.Title>My Page</S.Title>
      {error && <S.Error role="alert">{error}</S.Error>}
      <S.Grid>
        <S.ProfilePanel>
          <S.ProfileHeader>
            <S.Name>{me?.name ?? "사용자 정보 없음"}</S.Name>
            {me?.admin && <S.Badge>ADMIN</S.Badge>}
          </S.ProfileHeader>
          {loading && !me ? (
            <S.Muted>불러오는 중...</S.Muted>
          ) : (
            <S.ProfileMeta>
              <S.MetaRow>
                <S.MetaLabel>Role</S.MetaLabel>
                <S.MetaValue>{me?.admin ? "Admin" : "User"}</S.MetaValue>
              </S.MetaRow>
            </S.ProfileMeta>
          )}
        </S.ProfilePanel>

        <S.MembershipPanel>
          <S.SectionTitle>Membership</S.SectionTitle>
          {loading && !membership ? (
            <S.Muted>불러오는 중...</S.Muted>
          ) : membership ? (
            <>
              <S.StatusRow>
                <S.StatusPill $tone={membershipTone(membership.state)}>
                  {membership.state}
                </S.StatusPill>
                <S.Dday>{formatDday(membership.expiresAt)}</S.Dday>
              </S.StatusRow>
              <S.FlagList>
                <S.FlagItem $enabled={membership.canStudy}>AI 튜터</S.FlagItem>
                <S.FlagItem $enabled={membership.canChat}>Chat</S.FlagItem>
                <S.FlagItem $enabled={membership.canAnalyze}>
                  Analyze
                </S.FlagItem>
              </S.FlagList>
            </>
          ) : (
            <S.Muted>멤버십 정보를 확인할 수 없습니다.</S.Muted>
          )}
        </S.MembershipPanel>
      </S.Grid>
    </S.Container>
  );
}
