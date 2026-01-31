import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/client'
import { getMe } from '../../../shared/api/me'
import { getMembershipPlans } from '../../../shared/api/plans'
import { getUsers } from '../../../shared/api/users'
import { deleteUserMembership, getMembershipStatusForUser, updateUserMembership } from '../../../shared/api/membership'
import { useUserStore } from '../../../shared/store/userStore'
import * as S from '../AdminPage.styled'

type User = Awaited<ReturnType<typeof getUsers>>['users'][number]
type Plan = Awaited<ReturnType<typeof getMembershipPlans>>['plans'][number]
type MembershipStatus = Awaited<ReturnType<typeof getMembershipStatusForUser>>

export default function AdminPageView() {
  const navigate = useNavigate()
  const userId = useUserStore((state) => state.userId)
  const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [memberships, setMemberships] = useState<Record<number, MembershipStatus | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [cancelingUserId, setCancelingUserId] = useState<number | null>(null)
  const [selectedPlanIds, setSelectedPlanIds] = useState<Record<number, number | ''>>({})

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [meResponse, usersResponse, plansResponse] = await Promise.all([
          getMe(),
          getUsers(),
          getMembershipPlans(),
        ])
        if (!active) return
        setMe(meResponse)
        setUsers(usersResponse.users)
        setPlans(plansResponse.plans)
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('관리 데이터를 불러오지 못했습니다.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    if (userId) {
      load()
    }
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (me && !me.admin) {
      navigate('/404', { replace: true })
    }
  }, [me, navigate])

  useEffect(() => {
    let active = true
    const loadMemberships = async () => {
      if (!users.length) return
      const entries = await Promise.all(
        users.map(async (user) => {
          try {
            const status = await getMembershipStatusForUser(user.id)
            return [user.id, status] as const
          } catch {
            return [user.id, null] as const
          }
        }),
      )
      if (!active) return
      setMemberships(Object.fromEntries(entries))
      setSelectedPlanIds((prev) => {
        const next = { ...prev }
        entries.forEach(([uid, status]) => {
          next[uid] = status?.plan?.id ?? ''
        })
        return next
      })
    }

    loadMemberships()
    return () => {
      active = false
    }
  }, [users])

  const handlePlanChange = (userId: number, planId: number | '') => {
    setSelectedPlanIds((prev) => ({ ...prev, [userId]: planId }))
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
  }

  const handleSave = async (user: User) => {
    const planId = selectedPlanIds[user.id]
    if (!planId) return
    setSavingUserId(user.id)
    setError(null)
    try {
      await updateUserMembership(user.id, Number(planId))
      const status = await getMembershipStatusForUser(user.id)
      setMemberships((prev) => ({ ...prev, [user.id]: status }))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('멤버십 변경에 실패했습니다.')
      }
    } finally {
      setSavingUserId(null)
    }
  }

  const handleCancel = async (user: User) => {
    setCancelingUserId(user.id)
    setError(null)
    try {
      await deleteUserMembership(user.id)
      const status = await getMembershipStatusForUser(user.id)
      setMemberships((prev) => ({ ...prev, [user.id]: status }))
      setSelectedPlanIds((prev) => ({ ...prev, [user.id]: '' }))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('멤버십 해지에 실패했습니다.')
      }
    } finally {
      setCancelingUserId(null)
    }
  }

  const isAdmin = me?.admin
  const plansById = useMemo(() => {
    const map = new Map<number, Plan>()
    plans.forEach((plan) => map.set(plan.id, plan))
    return map
  }, [plans])

  if (!userId) {
    return (
      <S.Container>
        <S.Title>Admin</S.Title>
        <S.Error role="alert">유저를 선택해 주세요.</S.Error>
      </S.Container>
    )
  }

  if (isAdmin === false) {
    return (
      <S.Container>
        <S.Title>Admin</S.Title>
        <S.Error role="alert">접근 권한이 없습니다.</S.Error>
      </S.Container>
    )
  }

  return (
    <S.Container>
      <S.Title>Admin</S.Title>
      {error && <S.Error role="alert">{error}</S.Error>}
      <S.Table>
        <S.TableRow $header>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Plan</span>
          <span>Started</span>
          <span>Expires</span>
          <span>Change</span>
          <span>Action</span>
        </S.TableRow>
        {loading && <S.TableRow><S.CellMuted>로딩 중...</S.CellMuted></S.TableRow>}
        {!loading &&
          users.map((user) => {
            const status = memberships[user.id]
            const plan = status?.plan?.id ? plansById.get(status.plan.id) : null
            const tone = status?.state === 'premium' ? 'active' : status?.state === 'basic' ? 'warn' : 'neutral'
            const selected = selectedPlanIds[user.id] ?? ''
            const canSave = selected && Number(selected) !== (status?.plan?.id ?? 0)
            const canCancel = status?.state !== 'none'
            return (
              <S.TableRow key={user.id}>
                <span>{user.name}</span>
                <span>{user.admin ? 'Admin' : 'User'}</span>
                <S.Pill $tone={tone}>{status?.state ?? 'none'}</S.Pill>
                <span>{plan?.name ?? '-'}</span>
                <span>{formatDateTime(status?.startedAt)}</span>
                <span>{formatDateTime(status?.expiresAt)}</span>
                <S.PlanSelect value={selected} onChange={(event) => handlePlanChange(user.id, event.target.value ? Number(event.target.value) : '')}>
                  <option value="">선택</option>
                  {plans.map((planOption) => (
                    <option key={planOption.id} value={planOption.id}>
                      {planOption.name}
                    </option>
                  ))}
                </S.PlanSelect>
                <S.ActionGroup>
                  <S.ActionButton
                    disabled={!canSave || savingUserId === user.id}
                    onClick={() => handleSave(user)}
                  >
                    {savingUserId === user.id ? '저장중...' : '변경'}
                  </S.ActionButton>
                  <S.DangerButton
                    disabled={!canCancel || cancelingUserId === user.id}
                    onClick={() => handleCancel(user)}
                  >
                    {cancelingUserId === user.id ? '해지중...' : '해지'}
                  </S.DangerButton>
                </S.ActionGroup>
              </S.TableRow>
            )
          })}
      </S.Table>
    </S.Container>
  )
}
