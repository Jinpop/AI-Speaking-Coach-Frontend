import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const Shell = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f5f2;
  color: #1d1d1f;
`

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(247, 245, 242, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

export const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px clamp(16px, 4vw, 56px);
`

export const Brand = styled.span`
  font-weight: 700;
  font-size: clamp(18px, 1.6vw, 22px);
  letter-spacing: -0.02em;
`

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const UserSelect = styled.select`
  min-width: 180px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
`

export const AdminButton = styled(NavLink)`
  padding: 8px 14px;
  border-radius: 10px;
  background: #dc2626;
  color: #ffffff;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(220, 38, 38, 0.28);
  }
`

export const NavItem = styled(NavLink)`
  padding: 8px 14px;
  border-radius: 999px;
  color: #3c3f44;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease;

  &.active {
    background: #111827;
    color: #ffffff;
  }

  &:hover {
    background: rgba(17, 24, 39, 0.08);
  }
`

export const Main = styled.main`
  padding: 12px 0 48px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
