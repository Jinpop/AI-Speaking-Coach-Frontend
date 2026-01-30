import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { getMe } from '../api/me'
import { getUsers } from '../api/users'
import { useUserStore } from '../store/userStore'
import * as S from './AppLayout.styled'

export default function AppHeader() {
  const userId = useUserStore((state) => state.userId)
  const setUserId = useUserStore((state) => state.setUserId)
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>['users']>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    const loadUsers = async () => {
      setUsersLoading(true)
      setUsersError(null)
      try {
        const response = await getUsers()
        if (!active) return
        setUsers(response.users)
      } catch (error) {
        if (!active) return
        if (error instanceof ApiError) {
          setUsersError(error.message)
        } else {
          setUsersError('유저 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (active) setUsersLoading(false)
      }
    }

    loadUsers()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadMe = async () => {
      if (!userId) {
        setIsAdmin(false)
        return
      }
      try {
        const me = await getMe()
        if (!active) return
        setIsAdmin(!!me.admin)
      } catch {
        if (!active) return
        setIsAdmin(false)
      }
    }
    loadMe()
    return () => {
      active = false
    }
  }, [userId])

  const handleUserChange = (value: string) => {
    setUserId(value)
  }

  return (
    <S.Header>
      <S.HeaderInner>
        <S.Brand>Ringle</S.Brand>
          <S.HeaderControls>
            {isAdmin && (
              <S.AdminButton to="/admin">
                관리
              </S.AdminButton>
            )}
            <S.UserSelect value={userId} onChange={(event) => handleUserChange(event.target.value)}>
              <option value="" disabled>
                유저 선택
              </option>
              {usersLoading && <option disabled>불러오는 중...</option>}
              {users.map((user) => (
                <option key={user.id} value={String(user.id)}>
                  {user.name}
                </option>
              ))}
            </S.UserSelect>
            <S.Nav>
              <S.NavItem to="/" end>
                Home
              </S.NavItem>
              <S.NavItem to="/membership">Membership</S.NavItem>
              <S.NavItem to="/mypage">My Page</S.NavItem>
            </S.Nav>
          </S.HeaderControls>
      </S.HeaderInner>
      {usersError && <S.HeaderInner>{usersError}</S.HeaderInner>}
    </S.Header>
  )
}
