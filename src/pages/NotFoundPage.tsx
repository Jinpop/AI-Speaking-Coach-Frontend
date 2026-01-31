import * as S from "./NotFoundPage.styled";

export default function NotFoundPage() {
  return (
    <S.Page>
      <S.Card>
        <S.Code>404</S.Code>
        <S.Title>페이지를 찾을 수 없습니다</S.Title>
        <S.Description>요청하신 주소가 존재하지 않습니다.</S.Description>
        <S.Actions>
          <S.PrimaryLink to="/">홈으로 이동</S.PrimaryLink>
        </S.Actions>
      </S.Card>
    </S.Page>
  );
}
