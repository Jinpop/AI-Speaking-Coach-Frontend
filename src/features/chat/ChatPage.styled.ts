import styled from 'styled-components'

export const Page = styled.main`
  min-height: 100vh;
  padding: 16px clamp(16px, 4vw, 56px) 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f5f2;
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -0.02em;
`

export const Description = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`

export const TopicRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const TopicPill = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
`

export const ChatCard = styled.section`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

export const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`

export const MessageRow = styled.div<{ $role: 'ai' | 'user' }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
`

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
`

export const Bubble = styled.div<{ $role: 'ai' | 'user' }>`
  max-width: min(560px, 78%);
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  background: ${({ $role }) => ($role === 'user' ? '#111827' : '#f1f5f9')};
  color: ${({ $role }) => ($role === 'user' ? '#ffffff' : '#0f172a')};
  border: ${({ $role }) => ($role === 'user' ? 'none' : '1px solid rgba(148, 163, 184, 0.24)')};
`

export const HintList = styled.ul`
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 13px;
`

export const HintItem = styled.li`
  padding-left: 16px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
  }
`

export const InputBar = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f8fafc;
`

export const Input = styled.textarea`
  flex: 1;
  resize: none;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  min-height: 44px;
  background: #ffffff;
`

export const SendButton = styled.button`
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  cursor: not-allowed;
  opacity: 0.6;
`

export const FooterNote = styled.p`
  margin: 0;
  padding: 0 16px 16px;
  font-size: 12px;
  color: #94a3b8;
`
