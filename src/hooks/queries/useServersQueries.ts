import { useSuspenseQuery, useInfiniteQuery } from '@tanstack/react-query'
import serversApi from '@/api/serversApi'

export const getServersQueryKey = (page = 1, limit = 12, search = '') => [
  'servers',
  { page, limit, search },
]

export const prefetchServers = (page = 1, limit = 12, search = '') => ({
  queryKey: getServersQueryKey(page, limit, search),
  queryFn: () => serversApi.getServers(page, limit, search),
})

export function useGetServersQuery(page = 1, limit = 12, search = '') {
  return useSuspenseQuery(prefetchServers(page, limit, search))
}

export function useGetServersInfiniteQuery(limit = 12, search = '') {
  return useInfiniteQuery({
    queryKey: ['servers', 'infinite', { limit, search }],
    queryFn: ({ pageParam = 1 }) =>
      serversApi.getServers(pageParam, limit, search),
    getNextPageParam: lastPage => {
      const { page, total } = lastPage
      const totalPages = Math.ceil(total / limit)
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
