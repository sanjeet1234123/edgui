import { useQuery } from '@tanstack/react-query'
import serverApi from '@/api/serverApi'

export function useGetServerQuery(serverId: string) {
  return useQuery({
    queryKey: ['server', serverId],
    queryFn: () => serverApi.getServer(serverId),
    enabled: !!serverId,
  })
}

export function useGetRawGithubFileQuery(id: string) {
  return useQuery({
    queryKey: ['rawGithubFile', id],
    queryFn: () => serverApi.getRawGithubFile(id),
    enabled: !!id,
  })
}
