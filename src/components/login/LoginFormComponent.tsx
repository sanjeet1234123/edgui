import { Link } from '@tanstack/react-router'
import {
  Button,
  Group,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import classes from './login.module.css'
import type { UseFormReturnType } from '@mantine/form'
import type { LoginForm } from '@/types/loginType'
import { PATHS } from '@/constants/paths'

type LoginFormProps = {
  form: UseFormReturnType<LoginForm>
  isLoading: boolean
}

function LoginFormComponent({ form, isLoading }: LoginFormProps) {
  // Helper function to generate URL with email param if exists
  const getUrlWithEmailParam = (path: string) => {
    return form.values.email ? `${path}?email=${form.values.email}` : path
  }

  return (
    <>
      <Stack>
        <Stack gap={0}>
          <Text className="custom-label">
            Enter your workspace's team URL<strong>*</strong>
          </Text>
          <Group classNames={{ root: classes.workspaceGroup }}>
            <TextInput
              required
              size="md"
              placeholder="Enter workspace URL"
              className={classes.workspaceInput}
              styles={{
                root: {
                  flex: 1,
                },
              }}
              {...form.getInputProps('workspace')}
            />
            <Text className={classes.exampleUrl}>
              .nexastack.neuralcompany.work
            </Text>
          </Group>
          <Group justify="flex-end" mt="sm">
            <Link
              to={getUrlWithEmailParam(PATHS.FORGOT_WORKSPACE)}
              viewTransition
              className={classes.forgotWorkspace}
            >
              Forgot your workspace team URL?
            </Link>
          </Group>
        </Stack>

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
      </Stack>

      <Group justify="space-between" mt="xs">
        <Switch
          color="var(--clr-secondary)"
          label="Remember me"
          classNames={{ label: classes.checkboxLabel }}
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />
        <Link
          to={getUrlWithEmailParam(PATHS.FORGOT_PASSWORD)}
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
        Login to Platform
      </Button>
    </>
  )
}

export default LoginFormComponent
