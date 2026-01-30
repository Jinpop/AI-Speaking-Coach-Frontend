import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import * as S from './AppLayout.styled'

export default function AppLayout() {
  return (
    <S.Shell>
      <AppHeader />
      <S.Main>
        <Outlet />
      </S.Main>
    </S.Shell>
  )
}
