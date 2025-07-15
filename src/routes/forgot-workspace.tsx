import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type {
  ForgetWorkspaceForm,
  ForgetWorkspaceRequest,
} from '@/types/forgetWorkspaceType'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  ForgetWorkspaceFormComponent,
  ForgetWorkspaceHeader,
} from '@/components/forgetWorkspace/index'
import { PATHS } from '@/constants/paths'
import { useForgetWorkspaceMutation } from '@/hooks/mutations/useAuthMutations'
import classes from '@/components/forgetWorkspace/forgetWorkspace.module.css'
import { FullPageError, FullPageLoader } from '@/components/ui'
import { PublicRoute } from '@/components/RouteProtection'

export const Route = createFileRoute('/forgot-workspace')({
  component: PublicRouteWrapper,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
})

function PublicRouteWrapper() {
  return (
    <PublicRoute>
      <RouteComponent />
    </PublicRoute>
  )
}

// Define the schema for the form
const forgetWorkspaceSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
})

// Define the route component
function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: forget, isPending } = useForgetWorkspaceMutation()

  // Define the form
  const form = useForm<ForgetWorkspaceForm>({
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgetWorkspaceSchema),
  })

  // Define the handle submit function
  const handleSubmit = (values: ForgetWorkspaceRequest) => {
    forget(values, {
      onSuccess: () => {
        navigate({ to: PATHS.LOGIN })
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <ForgetWorkspaceHeader />
        <ForgetWorkspaceFormComponent form={form} isLoading={isPending} />
      </form>
    </AuthContainer>
  )
}

export default RouteComponent
