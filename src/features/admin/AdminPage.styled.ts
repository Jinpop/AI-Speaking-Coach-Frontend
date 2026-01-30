import styled from 'styled-components'

export const Container = styled.div`
  padding: 0 clamp(20px, 6vw, 80px);
  display: grid;
  gap: 24px;
`

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
`

export const Error = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 91, 91, 0.12);
  color: #b42318;
  border: 1px solid rgba(255, 91, 91, 0.35);
`

export const Table = styled.div`
  display: grid;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  overflow: hidden;
  background: #ffffff;
`

export const TableRow = styled.div<{ $header?: boolean }>`
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.9fr 1fr 1.1fr 1.1fr 1fr 0.8fr;
  gap: 12px;
  padding: 14px 16px;
  font-size: 14px;
  align-items: center;
  background: ${({ $header }) => ($header ? '#f8fafc' : '#ffffff')};
  font-weight: ${({ $header }) => ($header ? 700 : 500)};

  & + & {
    border-top: 1px solid rgba(15, 23, 42, 0.06);
  }
`

export const CellMuted = styled.span`
  color: #64748b;
`

export const PlanSelect = styled.select`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: #ffffff;
`

export const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  background: #111827;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const DangerButton = styled(ActionButton)`
  background: #dc2626;
`

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`

export const Pill = styled.span<{ $tone?: 'neutral' | 'active' | 'warn' }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $tone }) =>
    $tone === 'active'
      ? 'rgba(34, 197, 94, 0.16)'
      : $tone === 'warn'
        ? 'rgba(249, 115, 22, 0.16)'
        : 'rgba(15, 23, 42, 0.08)'};
  color: ${({ $tone }) =>
    $tone === 'active' ? '#16a34a' : $tone === 'warn' ? '#ea580c' : '#334155'};
`
