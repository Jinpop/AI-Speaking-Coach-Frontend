import styled from 'styled-components'

export const Page = styled.main`
  min-height: 100vh;
  padding: 48px clamp(20px, 6vw, 80px);
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const Title = styled.h1`
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
`

export const Description = styled.p`
  margin: 0;
  color: #6d6d72;
`

export const MutedText = styled.p`
  margin: 0;
  color: #6d6d72;
`

export const Alert = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 91, 91, 0.12);
  color: #b42318;
  border: 1px solid rgba(255, 91, 91, 0.35);
`

export const Grid = styled.section`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`

export const Card = styled.article`
  padding: 24px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
`

export const CardTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
`

export const CardList = styled.div`
  display: grid;
  gap: 12px;
`

export const CardItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const CardLabel = styled.span`
  color: #6d6d72;
`

export const CardValue = styled.span`
  font-weight: 600;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const Toast = styled.div<{ $tone?: 'success' | 'error' }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: ${({ $tone }) => ($tone === 'error' ? '#ef4444' : '#16a34a')};
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
`
