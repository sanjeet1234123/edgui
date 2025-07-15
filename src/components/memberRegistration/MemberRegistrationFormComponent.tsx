import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { MemberRegistrationForm } from '@/types/memberInvitationType'

type MemberRegistrationFormComponentProps = {
  form: UseFormReturnType<MemberRegistrationForm>
  isLoading: boolean
}

function MemberRegistrationFormComponent({
  form,
  isLoading,
}: MemberRegistrationFormComponentProps) {
  return (
    <Stack>
      <TextInput
        required
        label="Name"
        placeholder="Enter your name"
        {...form.getInputProps('name')}
      />
      <TextInput
        required
        label="Contact"
        placeholder="Enter your contact"
        {...form.getInputProps('contact')}
      />
      <PasswordInput
        required
        label="Password"
        placeholder="Enter your password"
        {...form.getInputProps('password')}
      />
      <PasswordInput
        required
        label="Confirm Password"
        placeholder="Confirm your password"
        {...form.getInputProps('confirm_password')}
      />

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Register to {sessionStorage.getItem('member_workspace')} workspace
      </Button>
    </Stack>
  )
}

export default MemberRegistrationFormComponent
