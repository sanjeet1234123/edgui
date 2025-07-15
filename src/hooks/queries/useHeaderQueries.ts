import { useQuery } from '@tanstack/react-query'
import headerApi from '@/api/headerApi'

export const useGetProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => headerApi.getProjects(),
  })
}
