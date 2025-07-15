import { Button, Stack, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { MemberSignupForm } from '@/types/memberInvitationType'

type MemberSignupFormComponentProps = {
  form: UseFormReturnType<MemberSignupForm>
  isLoading: boolean
}

function MemberSignupFormComponent({
  form,
  isLoading,
}: MemberSignupFormComponentProps) {
  return (
    <Stack>
      <TextInput
        required
        label="Email Address"
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
        Signup to {sessionStorage.getItem('member_workspace')} workspace
      </Button>
    </Stack>
  )
}

export default MemberSignupFormComponent
