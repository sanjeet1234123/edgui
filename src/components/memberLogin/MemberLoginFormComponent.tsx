import { Link } from '@tanstack/react-router'
import { Button, Group, PasswordInput, Stack, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { MemberLoginForm } from '@/types/memberInvitationType'
import { PATHS } from '@/constants/paths'
import classes from './memberLogin.module.css'

type MemberLoginFormComponentProps = {
  form: UseFormReturnType<MemberLoginForm>
  isLoading: boolean
}

function MemberLoginFormComponent({
  form,
  isLoading,
}: MemberLoginFormComponentProps) {
  return (
    <Stack>
      <TextInput
        required
        label="Email Address"
        placeholder="Enter your email"
        {...form.getInputProps('email')}
      />
      <PasswordInput
        required
        label="Password"
        placeholder="Enter your password"
        {...form.getInputProps('password')}
      />

      <Group justify="flex-end" mt="xs">
        <Link
          to={PATHS.FORGOT_PASSWORD}
          viewTransition
          className={classes.forgotPassword}
        >
          Forgot Password?
        </Link>
      </Group>

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Login to {sessionStorage.getItem('member_workspace')} workspace
      </Button>
    </Stack>
  )
}

export default MemberLoginFormComponent
