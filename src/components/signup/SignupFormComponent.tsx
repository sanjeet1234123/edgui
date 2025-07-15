import type { UseFormReturnType } from '@mantine/form'
import {
  Stack,
  TextInput,
  PasswordInput,
  Switch,
  Button,
  Group,
} from '@mantine/core'
import type { SignupForm } from '@/types/signupType'
import classes from './signup.module.css'

type SignupFormProps = {
  form: UseFormReturnType<SignupForm>
  isLoading: boolean
}

function SignupFormComponent({ form, isLoading }: SignupFormProps) {
  return (
    <>
      <Stack>
        <TextInput
          required
          size="md"
          label="Full Name"
          placeholder="Enter your name"
          {...form.getInputProps('name')}
        />

        <TextInput
          required
          label="Email Address"
          placeholder="Enter your email"
          {...form.getInputProps('email')}
        />

        <TextInput
          required
          label="Phone Number"
          placeholder="Enter your phone number"
          {...form.getInputProps('contact')}
        />

        <PasswordInput
          required
          label="Password"
          placeholder="Enter your password"
          {...form.getInputProps('password')}
        />
      </Stack>

      <Group>
        <Switch
          color="var(--clr-secondary)"
          label="Subscribe to newsletter"
          classNames={{ label: classes.checkboxLabel }}
          {...form.getInputProps('email_subscribed', { type: 'checkbox' })}
        />
      </Group>

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Create Account
      </Button>
    </>
  )
}

export default SignupFormComponent
