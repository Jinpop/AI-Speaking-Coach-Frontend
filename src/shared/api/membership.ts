import { apiRequest } from './client'

export type MembershipStatusResponse = {
  state: 'none' | 'basic' | 'premium'
  plan?: {
    id: number
    name: string
    tier: number
  } | null
  startedAt?: string | null
  expiresAt?: string | null
  canChat: boolean
  canStudy?: boolean
  canAnalyze?: boolean
}

export type MembershipCreateResponse = {
  membership: {
    plan: { id: number; name: string; tier: number }
    startedAt: string
    expiresAt: string
  }
}

export function createMembership(membershipPlanId: number) {
  return apiRequest<MembershipCreateResponse>({
    method: 'POST',
    url: '/api/memberships',
    data: { membership_plan_id: membershipPlanId },
  })
}

export function updateUserMembership(userId: number, membershipPlanId: number) {
  return apiRequest<MembershipCreateResponse>({
    method: 'PATCH',
    url: `/api/admin/users/${userId}/membership`,
    data: { membership_plan_id: membershipPlanId },
  })
}

export function deleteUserMembership(userId: number) {
  return apiRequest<void>({
    method: 'DELETE',
    url: '/api/membership',
    allowStatuses: [404],
    headers: { 'X-USER-ID': String(userId) },
  })
}

export function getMembershipStatus() {
  return apiRequest<MembershipStatusResponse>({
    method: 'GET',
    url: '/api/membership/status',
    allowStatuses: [404],
  })
}

export function getMembershipStatusForUser(userId: number) {
  return apiRequest<MembershipStatusResponse>({
    method: 'GET',
    url: '/api/membership/status',
    allowStatuses: [404],
    headers: { 'X-USER-ID': String(userId) },
  })
}
