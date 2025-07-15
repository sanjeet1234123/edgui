import { Link } from '@tanstack/react-router'
import { Button, Group, Text, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ForgetWorkspaceForm } from '@/types/forgetWorkspaceType'
import { PATHS } from '@/constants/paths'
import classes from '@/components/forgetWorkspace/forgetWorkspace.module.css'

type ForgetWorkspaceFormComponentProps = {
  form: UseFormReturnType<ForgetWorkspaceForm>
  isLoading: boolean
}
export default function ForgetWorkspaceFormComponent({
  form,
  isLoading,
}: ForgetWorkspaceFormComponentProps) {
  return (
    <>
      <TextInput
        required
        size="md"
        label="Please enter your email"
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
        Send Me Instructions
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
