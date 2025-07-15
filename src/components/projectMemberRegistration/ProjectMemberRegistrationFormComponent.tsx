import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ProjectMemberRegistrationForm } from '@/types/memberInvitationType'
import classes from './projectMemberRegistration.module.css'

type ProjectMemberRegistrationFormComponentProps = {
  form: UseFormReturnType<ProjectMemberRegistrationForm>
  isLoading: boolean
}

function ProjectMemberRegistrationFormComponent({
  form,
  isLoading,
}: ProjectMemberRegistrationFormComponentProps) {
  return (
    <Stack>
      <TextInput
        required
        label="Email"
        placeholder="Enter your email"
        classNames={classes}
        {...form.getInputProps('email')}
      />
      <PasswordInput
        required
        label="Password"
        placeholder="Enter your password"
        classNames={classes}
        {...form.getInputProps('password')}
      />

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Register to {sessionStorage.getItem('project_workspace')} workspace
      </Button>
    </Stack>
  )
}

export default ProjectMemberRegistrationFormComponent
