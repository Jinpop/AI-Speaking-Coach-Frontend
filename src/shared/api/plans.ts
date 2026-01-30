import { apiRequest } from './client'

export type MembershipPlan = {
  id: number
  name: string
  tier: number
  durationDays: number
  canStudy: boolean
  canChat: boolean
  canAnalyze: boolean
}

export type MembershipPlansResponse = {
  plans: MembershipPlan[]
}

export function getMembershipPlans() {
  return apiRequest<MembershipPlansResponse>({
    method: 'GET',
    url: '/api/membership_plans',
  })
}
