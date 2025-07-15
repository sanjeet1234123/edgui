import { Navigate, createFileRoute } from '@tanstack/react-router'
import { FullPageError, FullPageLoader } from '@/components/ui'
import useAuthStore from '@/store/authStore'

export const Route = createFileRoute('/')({
  component: App,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
})

function App() {
  const { isAuthenticated } = useAuthStore()
  return <Navigate to={isAuthenticated ? '/marketplace' : '/login'} />
}
