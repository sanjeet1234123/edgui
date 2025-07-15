import { useSuspenseQuery } from '@tanstack/react-query'
import workspaceApi from '@/api/workspaceApi'

export const prefetchWorkspaceMembers = {
  queryKey: ['workspaceMembers'],
  queryFn: () => workspaceApi.getWorkspaceMembers(),
}

export function useGetWorkspaceMembersQuery() {
  return useSuspenseQuery(prefetchWorkspaceMembers)
}
