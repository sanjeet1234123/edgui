import { useForm } from '@mantine/form'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { SignupForm } from '@/types/signupType'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  SignupBottomNavigation,
  SignupFormComponent,
  SignupHeader,
} from '@/components/signup'
import { useSignupMutation } from '@/hooks/mutations/useAuthMutations'
import { PATHS } from '@/constants/paths'
import { FullPageError, FullPageLoader } from '@/components/ui'
import classes from '@/components/signup/signup.module.css'
import { PublicRoute } from '@/components/RouteProtection'

// Define the route for the signup page
export const Route = createFileRoute('/signup')({
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

// Define the validation schema with Zod
const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
  name: z.string().min(3, 'Name is required'),
  country: z.string().optional(),
  contact: z.string().min(5, 'Contact is required'),
  password: z.string().min(8, 'Password is required'),
  email_subscribed: z.boolean().default(false),
})

// Define the route component
function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: signup, isPending } = useSignupMutation()

  const form = useForm<SignupForm>({
    initialValues: {
      email: '',
      name: '',
      country: '',
      contact: '',
      password: '',
      email_subscribed: false,
    },
    validate: zodResolver(signupSchema),
  })

  // Handle the form submission
  const handleSubmit = (values: SignupForm) => {
    const { country, ...signupData } = values

    signup(signupData, {
      onSuccess: () => {
        sessionStorage.setItem('email', form.values.email)
        navigate({ to: PATHS.CONFIRM_EMAIL })
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <SignupHeader />
        <SignupFormComponent form={form} isLoading={isPending} />
        <SignupBottomNavigation />
      </form>
    </AuthContainer>
  )
}
