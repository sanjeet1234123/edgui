import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { LoginForm } from '@/types/loginType'
import AuthContainer from '@/components/authContainer/authContainer'
import { FullPageError, FullPageLoader } from '@/components/ui'
import {
  LoginBottomNavigation,
  LoginFormComponent,
  LoginHeader,
} from '@/components/login'
import classes from '@/components/login/login.module.css'
import { useLoginMutation } from '@/hooks/mutations/useAuthMutations'
import { PATHS } from '@/constants/paths'
import { PublicRoute } from '@/components/RouteProtection'

// Define the route for the login page
export const Route = createFileRoute('/login')({
  component: PublicRouteWrapper,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
})

// Wrapper component that applies route protection
function PublicRouteWrapper() {
  return (
    <PublicRoute>
      <RouteComponent />
    </PublicRoute>
  )
}

// Define the validation schema with Zod
const loginSchema = z.object({
  workspace: z
    .string()
    .min(1, 'Workspace URL is required')
    .regex(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/, 'Enter a valid workspace URL'),
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

// Define the route component
function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLoginMutation()

  // Define the form
  const form = useForm<LoginForm>({
    initialValues: {
      workspace: '',
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: zodResolver(loginSchema),
  })

  // Handle the form submission
  const handleSubmit = (values: LoginForm) => {
    login(values, {
      onSuccess: () => {
        navigate({ to: PATHS.MARKETPLACE })
      },
    })
  }

  // Render the component
  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <LoginHeader />
        <LoginFormComponent form={form} isLoading={isPending} />
        <LoginBottomNavigation form={form} />
      </form>
    </AuthContainer>
  )
}
