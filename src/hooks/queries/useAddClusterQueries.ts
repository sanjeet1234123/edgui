import { useQuery } from '@tanstack/react-query'
import addClusterApi from '@/api/addClusterApi'

export const fetchAwsRole = {
  queryKey: ['awsRole'],
  queryFn: () => addClusterApi.getAwsRole(),
}

export const useAwsRoleQuery = () => {
  return useQuery(fetchAwsRole)
}
