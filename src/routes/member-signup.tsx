import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { MemberSignupForm } from '@/types/memberInvitationType'
import { PATHS } from '@/constants/paths'
import AuthContainer from '@/components/authContainer/authContainer'
import classes from '@/components/memberSignup/memberSignup.module.css'
import {
  MemberSignupBottomNavigation,
  MemberSignupFormComponent,
  MemberSignupHeader,
} from '@/components/memberSignup'
import { useMemberSignupMutation } from '@/hooks/mutations/useMemberInvitationMutations'

export const Route = createFileRoute('/member-signup')({
  component: RouteComponent,
})

const memberSignupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^([-\w\d]+)(\.[-\w\d]+)*@([-\w\d]+)(\.[-\w\d]{2,})$/,
      'Enter a valid email address',
    ),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutate: memberSignup, isPending } = useMemberSignupMutation()
  const [signupSuccess, setSignupSuccess] = useState(false)

  const form = useForm<MemberSignupForm>({
    initialValues: {
      email: '',
    },
    validate: zodResolver(memberSignupSchema),
  })

  // if no workspace is provided, navigate to signup page
  useEffect(() => {
    if (!sessionStorage.getItem('member_workspace')) {
      navigate({ to: PATHS.SIGNUP })
      return
    }
  }, [navigate])

  // prevent rendering if no workspace is provided
  if (!sessionStorage.getItem('member_workspace')) return null

  const handleSubmit = (values: MemberSignupForm) => {
    if (!sessionStorage.getItem('member_workspace')) {
      return
    }

    const payload = {
      email: values.email,
      workspace: sessionStorage.getItem('member_workspace') as string,
    }

    memberSignup(payload, {
      onSuccess: () => {
        setSignupSuccess(true)
        setTimeout(() => {
          navigate({ to: PATHS.LOGIN })
        }, 5000) // Show success message for 5 seconds before redirecting
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <MemberSignupHeader signupSuccess={signupSuccess} />
        <MemberSignupFormComponent form={form} isLoading={isPending} />
        <MemberSignupBottomNavigation />
      </form>
    </AuthContainer>
  )
}
