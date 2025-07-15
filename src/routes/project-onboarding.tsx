import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type {
  ProjectMemberRegistrationForm,
  ProjectMemberRegistrationRequest,
} from '@/types/memberInvitationType'
import { useProjectMemberRegistrationMutation } from '@/hooks/mutations/useMemberInvitationMutations'
import { showNotification } from '@/utils/notification'
import { PATHS } from '@/constants/paths'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  ProjectMemberRegistrationFooter,
  ProjectMemberRegistrationFormComponent,
  ProjectMemberRegistrationHeader,
} from '@/components/projectMemberRegistration'
import classes from '@/components/projectMemberRegistration/projectMemberRegistration.module.css'

export const Route = createFileRoute('/project-onboarding')({
  component: RouteComponent,
  validateSearch: (search) => ({
    ws: search.ws as string | undefined,
    project_id: search.project_id as string | undefined,
    token: search.token as string | undefined,
  }),
})

const ProjectMemberRegistrationSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

function RouteComponent() {
  const { ws, project_id, token } = Route.useSearch()
  const navigate = useNavigate()

  const { mutate: projectMemberRegistration, isPending } =
    useProjectMemberRegistrationMutation()

  const form = useForm<ProjectMemberRegistrationForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(ProjectMemberRegistrationSchema),
  })

  useEffect(() => {
    if (!ws || !project_id || !token) {
      showNotification(
        'error',
        'Invalid registration link, please use the link sent to your email',
      )
      navigate({ to: PATHS.LOGIN })
      return
    }

    // set session storage items
    sessionStorage.setItem('project_workspace', ws)
    sessionStorage.setItem('project_id', project_id)
    sessionStorage.setItem('project_token', token)
  }, [ws, project_id, token, navigate])

  // prevent rendering if no workspace, project_id or token is provided
  if (!ws || !project_id || !token) return null

  const handleSubmit = (values: ProjectMemberRegistrationForm) => {
    if (!ws || !project_id || !token) {
      return
    }

    const payload: ProjectMemberRegistrationRequest = {
      email: values.email,
      password: values.password,
      workspace: ws,
      project_id: project_id,
      token: token,
    }

    projectMemberRegistration(payload, {
      onSuccess: () => {
        navigate({ to: PATHS.MARKETPLACE })

        // remove session storage items
        sessionStorage.removeItem('project_workspace')
        sessionStorage.removeItem('project_id')
        sessionStorage.removeItem('project_token')
      },
    })
  }

  return (
    <AuthContainer>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
        <ProjectMemberRegistrationHeader />
        <ProjectMemberRegistrationFormComponent
          form={form}
          isLoading={isPending}
        />
        <ProjectMemberRegistrationFooter />
      </form>
    </AuthContainer>
  )
}
