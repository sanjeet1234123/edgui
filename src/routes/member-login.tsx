import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { MemberLoginForm } from '@/types/memberInvitationType'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  MemberLoginBottomNavigation,
  MemberLoginFormComponent,
  MemberLoginHeader,
} from '@/components/memberLogin'
import { useMemberLoginMutation } from '@/hooks/mutations/useMemberInvitationMutations'
import { PATHS } from '@/constants/paths'
import classes from '@/components/memberLogin/memberLogin.module.css'

export const Route = createFileRoute('/member-login')({
  component: RouteComponent,
  validateSearch: (search) => ({
    ws: search.ws as string | undefined,
  }),
})

const memberLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
  password: z.string().min(1, 'Password is required'),
})

function RouteComponent() {
  const { ws } = Route.useSearch()
  const navigate = useNavigate()

  const { mutate: memberLogin, isPending } = useMemberLoginMutation()

  const form = useForm<MemberLoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(memberLoginSchema),
  })

  // if no workspace is provided, navigate to login page
  useEffect(() => {
    if (!ws) {
      navigate({ to: PATHS.LOGIN })
      return
    }

    // set session storage items
    sessionStorage.setItem('member_workspace', ws)
  }, [ws, navigate])

  // prevent rendering if no workspace is provided
  if (!ws) return null

  const handleSubmit = (values: MemberLoginForm) => {
    if (!ws) return

    const payload = {
      email: values.email,
      password: values.password,
      workspace: ws,
    }

    memberLogin(payload, {
      onSuccess: () => {
        navigate({ to: PATHS.MARKETPLACE })

        // remove session storage items
        sessionStorage.removeItem('member_workspace')
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <MemberLoginHeader />
        <MemberLoginFormComponent form={form} isLoading={isPending} />
        <MemberLoginBottomNavigation />
      </form>
    </AuthContainer>
  )
}
