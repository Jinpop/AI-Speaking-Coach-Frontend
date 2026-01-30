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

export const Error = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 91, 91, 0.12);
  color: #b42318;
  border: 1px solid rgba(255, 91, 91, 0.35);
`

export const PlansSection = styled.section`
  display: grid;
  gap: 18px;
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #0f172a;
`

export const PlanGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`

export const PlanCard = styled.article<{ $featured?: boolean }>`
  position: relative;
  padding: 22px 20px 24px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: ${({ $featured }) =>
    $featured ? '0 20px 40px rgba(79, 70, 229, 0.2)' : '0 12px 30px rgba(0, 0, 0, 0.06)'};
  display: grid;
  gap: 14px;
`

export const PlanBadge = styled.span<{ $tone?: 'indigo' | 'emerald' }>`
  position: absolute;
  top: -10px;
  left: 18px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: ${({ $tone }) => ($tone === 'emerald' ? '#22c55e' : '#4f46e5')};
`

export const PlanHeader = styled.div`
  display: grid;
  gap: 6px;
`

export const PlanName = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
`

export const PlanDuration = styled.span`
  font-size: 13px;
  color: #64748b;
`

export const PlanMeta = styled.div`
  display: grid;
  gap: 6px;
  color: #1e293b;
`

export const PriceHint = styled.span`
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
`

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const Discount = styled.span`
  color: #ef4444;
  font-weight: 700;
  font-size: 14px;
`

export const Price = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
`

export const PlanFeatureList = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 8px;
`

export const FeatureItem = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #334155;
`

export const FeatureLabel = styled.span`
  font-weight: 600;
`

export const FeatureValue = styled.span`
  color: #0f172a;
  font-weight: 700;
`

export const PlanCTA = styled.button<{ $featured?: boolean }>`
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  background: ${({ $featured }) => ($featured ? '#4f46e5' : '#111827')};
  color: #ffffff;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 60;
`

export const ModalCard = styled.div`
  width: min(520px, 92vw);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  padding: 24px;
  display: grid;
  gap: 16px;
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const ModalTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  color: #0f172a;
`

export const ModalBody = styled.div`
  display: grid;
  gap: 10px;
  color: #334155;
  font-size: 14px;
`

export const ModalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  & > button {
    margin-top: 0;
  }
`

export const GhostButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: #ffffff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
`

export const CurrentSection = styled.section`
  padding: 22px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.08), rgba(148, 163, 184, 0.2));
  display: grid;
  gap: 12px;
`

export const CurrentTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #0f172a;
`

export const CurrentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

export const StatusPill = styled.span<{ $tone?: 'neutral' | 'active' | 'warn' }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${({ $tone }) =>
    $tone === 'active'
      ? 'rgba(34, 197, 94, 0.16)'
      : $tone === 'warn'
        ? 'rgba(249, 115, 22, 0.16)'
        : 'rgba(15, 23, 42, 0.08)'};
  color: ${({ $tone }) =>
    $tone === 'active' ? '#16a34a' : $tone === 'warn' ? '#ea580c' : '#334155'};
`

export const Dday = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
`

export const FlagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Flag = styled.span<{ $enabled?: boolean }>`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $enabled }) =>
    $enabled ? 'rgba(15, 118, 110, 0.12)' : 'rgba(148, 163, 184, 0.2)'};
  color: ${({ $enabled }) => ($enabled ? '#0f766e' : '#64748b')};
`

export const Muted = styled.p`
  margin: 0;
  color: #64748b;
`
