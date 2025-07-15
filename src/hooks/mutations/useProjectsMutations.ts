import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import projectsApi from '@/api/projectsApi'
import { showNotification } from '@/utils/notification'

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: any) => projectsApi.createProject(values),
    onSuccess: () => {
      showNotification('success', 'Project created successfully')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Error creating project',
        )
      }
    },
  })
}
