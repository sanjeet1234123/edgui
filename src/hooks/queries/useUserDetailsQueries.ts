import { useSuspenseQuery } from '@tanstack/react-query'
import userDetailsApi from '@/api/userDetailsApi'

export const userDetailsKeys = {
  all: ['userDetails'] as const,
  details: () => [...userDetailsKeys.all, 'details'] as const,
}

export const prefetchUserDetails = () => ({
  queryKey: userDetailsKeys.details(),
  queryFn: () => userDetailsApi.getUserDetails(),
})

export function useGetUserDetailsQuery() {
  return useSuspenseQuery(prefetchUserDetails())
}
