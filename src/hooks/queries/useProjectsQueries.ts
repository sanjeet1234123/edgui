import { useSuspenseQuery } from '@tanstack/react-query'
import projectsApi from '@/api/projectsApi'

export const prefetchProjects = {
  queryKey: ['projects'],
  queryFn: () => projectsApi.getProjects(),
}

export function useGetProjectsQuery() {
  return useSuspenseQuery(prefetchProjects)
}
