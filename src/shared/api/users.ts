import { apiRequest } from './client'

export type User = {
  id: number
  name: string
  admin: boolean
}

export type UsersResponse = {
  users: User[]
}

export function getUsers() {
  return apiRequest<UsersResponse>({
    method: 'GET',
    url: '/api/users',
  })
}
