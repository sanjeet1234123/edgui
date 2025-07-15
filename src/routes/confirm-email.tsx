import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { ConfirmEmailForm } from '@/types/confirmEmailType'
import { PATHS } from '@/constants/paths'
import { FullPageError, FullPageLoader } from '@/components/ui'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  ConfirmEmailFormComponent,
  ConfirmEmailHeader,
} from '@/components/confirmEmail'
import { useVerifyEmailMutation } from '@/hooks/mutations/useAuthMutations'
import classes from '@/components/confirmEmail/confirmEmail.module.css'
import { PrivateRoute } from '@/components/RouteProtection'

// Define the route for the confirm email page
export const Route = createFileRoute('/confirm-email')({
  component: PrivateRouteWrapper,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
})

function PrivateRouteWrapper() {
  return (
    <PrivateRoute requiredStates={{ email: sessionStorage.getItem('email') }}>
      <RouteComponent />
    </PrivateRoute>
  )
}

// Define the validation schema with Zod
const confirmEmailSchema = z.object({
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

// Define the route component
function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: verifyEmail, isPending } = useVerifyEmailMutation()

  // Redirect to signup page if email is not in session storage
  useEffect(() => {
    if (sessionStorage.getItem('email') === null) {
      navigate({ to: PATHS.SIGNUP })
    }
  }, [navigate])

  // Define the form
  const form = useForm<ConfirmEmailForm>({
    initialValues: {
      verificationCode: '',
    },
    validate: zodResolver(confirmEmailSchema),
  })

  // Handle the form submission
  const handleSubmit = (values: ConfirmEmailForm) => {
    verifyEmail(
      {
        email: sessionStorage.getItem('email')!,
        verification_code: values.verificationCode,
      },
      {
        onSuccess: () => {
          navigate({ to: PATHS.PLATFORM_SETUP })
        },
      },
    )
  }

  // Render the component
  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <ConfirmEmailHeader />
        <ConfirmEmailFormComponent form={form} isLoading={isPending} />
      </form>
    </AuthContainer>
  )
}
