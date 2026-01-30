import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

export const Page = styled.main`
  min-height: 100vh;
  padding: 16px clamp(16px, 4vw, 56px) 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f7f5f2;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
`;

export const Description = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

export const CardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
`;

export const Card = styled.article<{ $disabled?: boolean }>`
  display: grid;
  gap: 10px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  position: relative;

  ${({ $disabled }) =>
    $disabled &&
    css`
      & > *:not(${DisabledOverlay}) {
        opacity: 0.5;
      }
    `}
`;

export const CardImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

export const CardBody = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
`;

export const DisabledTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
`;

export const CardLink = styled(Link)<{ $disabled?: boolean }>`
  text-decoration: none;
  color: inherit;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`;

export const DisabledOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 16px;
  text-align: center;
  padding: 12px;
  z-index: 1;
`;

export const DisabledText = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.3);
  position: relative;
  z-index: 2;
`;

export const Category = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 999px;
  padding: 4px 10px;
  width: fit-content;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
  color: #0f172a;
`;

export const CardDescription = styled.p`
  margin: 0;
  color: #475569;
  font-size: 13px;
`;

export const CardMeta = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;
