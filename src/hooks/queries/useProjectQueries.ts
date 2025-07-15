import { useSuspenseQuery } from '@tanstack/react-query'
import projectApi from '@/api/projectApi'

// Project
export const prefetchProject = (projectId: string) => ({
  queryKey: ['project', projectId],
  queryFn: () => projectApi.getProject(projectId),
  enabled: !!projectId,
})

export function useGetProjectQuery(projectId: string) {
  return useSuspenseQuery(prefetchProject(projectId))
}

// Project Activities
export const prefetchProjectActivities = (projectId: string) => ({
  queryKey: ['projectActivities', projectId],
  queryFn: () => projectApi.getProjectActivities(projectId),
  enabled: !!projectId,
})

export function useGetProjectActivitiesQuery(projectId: string) {
  return useSuspenseQuery(prefetchProjectActivities(projectId))
}

// Project Members
export const prefetchProjectMembers = (projectId: string) => ({
  queryKey: ['projectMembers', projectId],
  queryFn: () => projectApi.getProjectMembers(projectId),
  enabled: !!projectId,
})

export function useGetProjectMembersQuery(projectId: string) {
  return useSuspenseQuery(prefetchProjectMembers(projectId))
}
