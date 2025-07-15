import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type {
  ForgetPasswordForm,
  ForgetPasswordRequest,
} from '@/types/forgetPasswordType'
import { PATHS } from '@/constants/paths'
import {
  ForgetPasswordFormComponent,
  ForgetPasswordHeader,
} from '@/components/forgetPassword/index'
import AuthContainer from '@/components/authContainer/authContainer'
import { useForgetPasswordMutation } from '@/hooks/mutations/useAuthMutations'
import classes from '@/components/forgetPassword/forgetPassword.module.css'
import { FullPageError, FullPageLoader } from '@/components/ui'
import { PublicRoute } from '@/components/RouteProtection'

// Define the route for the forgot password page
export const Route = createFileRoute('/forgot-password')({
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
const forgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
  state: z.string().default('forgot'),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: forget, isPending } = useForgetPasswordMutation()

  // Define the form
  const form = useForm<ForgetPasswordForm>({
    initialValues: {
      email: '',
      state: 'forgot',
    },
    validate: zodResolver(forgetPasswordSchema),
  })

  const handleSubmit = (values: ForgetPasswordRequest) => {
    forget(values, {
      onSuccess: () => {
        navigate({ to: PATHS.LOGIN })
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <ForgetPasswordHeader />
        <ForgetPasswordFormComponent form={form} isLoading={isPending} />
      </form>
    </AuthContainer>
  )
}
