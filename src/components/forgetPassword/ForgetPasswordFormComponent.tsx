import { Link } from '@tanstack/react-router'
import { Button, Group, Text, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ForgetPasswordForm } from '@/types/forgetPasswordType'
import { PATHS } from '@/constants/paths'
import classes from '@/components/forgetPassword/forgetPassword.module.css'

type ForgetPasswordFormComponentProps = {
  form: UseFormReturnType<ForgetPasswordForm>
  isLoading: boolean
}
export default function ForgetPasswordFormComponent({
  form,
  isLoading,
}: ForgetPasswordFormComponentProps) {
  return (
    <>
      <TextInput
        required
        size="md"
        label="Please enter the email to receive verification code"
        placeholder="Enter your email"
        {...form.getInputProps('email')}
      />
      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Reset Password
      </Button>

      <Group justify="center">
        <Text size="sm" className={classes.accountText}>
          Back to{' '}
          <Link to={PATHS.LOGIN} viewTransition className={classes.linkText}>
            Login
          </Link>
        </Text>
      </Group>
    </>
  )
}
