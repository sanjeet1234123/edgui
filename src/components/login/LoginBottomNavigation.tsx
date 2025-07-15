import { Stack, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { PATHS } from '@/constants/paths'
import classes from './login.module.css'
import type { LoginForm } from '@/types/loginType'
import type { UseFormReturnType } from '@mantine/form'

type LoginBottomNavigationProps = {
  form: UseFormReturnType<LoginForm>
}

function LoginBottomNavigation({ form }: LoginBottomNavigationProps) {
  // Helper function to generate URL with email param if exists
  const getUrlWithEmailParam = (path: string) => {
    return form.values.email ? `${path}?email=${form.values.email}` : path
  }

  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Do not have an Account?{' '}
        <Link to={PATHS.SIGNUP} viewTransition className={classes.linkText}>
          Signup to Platform
        </Link>
      </Text>

      <Text size="sm" className={classes.accountText}>
        Already have an account but not workspace?{' '}
        <Link
          to={getUrlWithEmailParam(PATHS.FORGOT_WORKSPACE)}
          viewTransition
          className={classes.linkText}
        >
          Create workspace
        </Link>
      </Text>
    </Stack>
  )
}

export default LoginBottomNavigation
