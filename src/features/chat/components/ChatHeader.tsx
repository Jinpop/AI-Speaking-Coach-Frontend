import * as S from '../ChatPage.styled'

export default function ChatHeader() {
  return (
    <S.Header>
      <S.Title>자기소개 잘하는 법</S.Title>
      <S.Description>첫인상을 높이는 자기소개 구성과 톤을 함께 연습합니다.</S.Description>
      <S.TopicRow>
        <S.TopicPill>#자기소개</S.TopicPill>
        <S.TopicPill>#첫인상</S.TopicPill>
        <S.TopicPill>#말하기</S.TopicPill>
      </S.TopicRow>
    </S.Header>
  )
}
