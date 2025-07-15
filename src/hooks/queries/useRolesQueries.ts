import { useQuery } from '@tanstack/react-query'
import rolesApi from '@/api/rolesApi'

export function useGetRolesQuery() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  })
}
