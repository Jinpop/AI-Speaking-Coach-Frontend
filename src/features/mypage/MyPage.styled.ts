import styled from 'styled-components'

export const Container = styled.div`
  padding: 0 clamp(20px, 6vw, 80px);
  display: grid;
  gap: 28px;
`

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
`

export const Grid = styled.section`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`

export const ProfilePanel = styled.section`
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #12131a 0%, #2a2d3f 100%);
  color: #f5f5f6;
  display: grid;
  gap: 18px;
`

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Name = styled.h2`
  margin: 0;
  font-size: 24px;
`

export const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
`

export const ProfileMeta = styled.div`
  display: grid;
  gap: 12px;
`

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
`

export const MetaLabel = styled.span`
  color: rgba(255, 255, 255, 0.64);
`

export const MetaValue = styled.span`
  font-weight: 600;
`

export const MembershipPanel = styled.section`
  padding: 28px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 18px;
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
`

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const StatusPill = styled.span<{ $tone?: 'neutral' | 'active' | 'warn' }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $tone }) =>
    $tone === 'active'
      ? 'rgba(34, 197, 94, 0.16)'
      : $tone === 'warn'
        ? 'rgba(249, 115, 22, 0.16)'
        : 'rgba(17, 24, 39, 0.08)'};
  color: ${({ $tone }) =>
    $tone === 'active' ? '#16a34a' : $tone === 'warn' ? '#ea580c' : '#334155'};
`

export const Dday = styled.span`
  font-size: 20px;
  font-weight: 700;
`

export const FlagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const FlagItem = styled.div<{ $enabled?: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  background: ${({ $enabled }) =>
    $enabled ? 'rgba(15, 118, 110, 0.1)' : 'rgba(148, 163, 184, 0.2)'};
  color: ${({ $enabled }) => ($enabled ? '#0f766e' : '#64748b')};
  font-size: 13px;
  font-weight: 600;
`

export const Muted = styled.p`
  margin: 0;
  color: #6d6d72;
`

export const Error = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 91, 91, 0.12);
  color: #b42318;
  border: 1px solid rgba(255, 91, 91, 0.35);
`
