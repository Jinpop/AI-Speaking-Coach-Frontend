import { apiRequest } from './client'

export type MeResponse = {
  id: number
  name: string
  admin: boolean
}

export function getMe() {
  return apiRequest<MeResponse>({
    method: 'GET',
    url: '/api/me',
  })
}
