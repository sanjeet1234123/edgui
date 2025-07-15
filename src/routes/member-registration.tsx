import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type {
  MemberRegistrationForm,
  MemberRegistrationRequest,
} from '@/types/memberInvitationType'
import AuthContainer from '@/components/authContainer/authContainer'
import classes from '@/components/memberRegistration/memberRegistration.module.css'
import { PATHS } from '@/constants/paths'
import { useMemberRegistrationMutation } from '@/hooks/mutations/useMemberInvitationMutations'
import {
  MemberRegistrationBottomNavigation,
  MemberRegistrationFormComponent,
  MemberRegistrationHeader,
} from '@/components/memberRegistration'
import { showNotification } from '@/utils/notification'

export const Route = createFileRoute('/member-registration')({
  component: RouteComponent,
  validateSearch: (search) => ({
    ws: search.ws as string | undefined,
    token: search.token as string | undefined,
  }),
})

const memberRegistrationSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    contact: z.string().min(1, 'Contact is required'),
    password: z.string().min(1, 'Password is required'),
    confirm_password: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

function RouteComponent() {
  const { ws, token } = Route.useSearch()
  const navigate = useNavigate()

  const { mutate: memberRegistration, isPending } =
    useMemberRegistrationMutation()

  const form = useForm<MemberRegistrationForm>({
    initialValues: {
      name: '',
      contact: '',
      password: '',
      confirm_password: '',
    },
    validate: zodResolver(memberRegistrationSchema),
  })

  // if no workspace or token is provided, navigate to login page
  useEffect(() => {
    if (!ws || !token) {
      showNotification(
        'error',
        'Invalid registration link, please use the link sent to your email',
      )
      navigate({ to: PATHS.LOGIN })
      return
    }

    // set session storage items
    sessionStorage.setItem('member_workspace', ws)
    sessionStorage.setItem('member_token', token)
  }, [ws, token, navigate])

  // prevent rendering if no workspace or token is provided
  if (!ws || !token) return null

  const handleSubmit = (values: MemberRegistrationForm) => {
    if (!ws || !token) return

    const payload: MemberRegistrationRequest = {
      name: values.name,
      contact: values.contact,
      password: values.password,
      token,
      workspace: ws,
    }

    memberRegistration(payload, {
      onSuccess: () => {
        navigate({ to: PATHS.LOGIN })

        // remove session storage items
        sessionStorage.removeItem('member_workspace')
        sessionStorage.removeItem('member_token')
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <MemberRegistrationHeader />
        <MemberRegistrationFormComponent form={form} isLoading={isPending} />
        <MemberRegistrationBottomNavigation />
      </form>
    </AuthContainer>
  )
}
