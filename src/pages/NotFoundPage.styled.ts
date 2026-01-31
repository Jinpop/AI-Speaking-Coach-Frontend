import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Page = styled.main`
  min-height: 100vh;
  padding: 24px clamp(16px, 4vw, 56px) 48px;
  background: #f7f5f2;
  display: grid;
  place-items: center;
`

export const Card = styled.section`
  width: min(520px, 92vw);
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
  padding: 28px;
  display: grid;
  gap: 12px;
  text-align: center;
`

export const Code = styled.span`
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #111827;
`

export const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  color: #0f172a;
`

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
`

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
  flex-wrap: wrap;
`

export const PrimaryLink = styled(Link)`
  padding: 10px 16px;
  border-radius: 12px;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
`

export const GhostLink = styled(Link)`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  color: #111827;
  font-weight: 700;
  text-decoration: none;
  background: #ffffff;
`
