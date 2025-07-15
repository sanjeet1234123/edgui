import { Stack, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { PATHS } from '@/constants/paths'
import classes from './signup.module.css'

function SignupBottomNavigation() {
  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Already have an Account?{' '}
        <Link to={PATHS.LOGIN} viewTransition className={classes.linkText}>
          Login to Platform
        </Link>
      </Text>
    </Stack>
  )
}

export default SignupBottomNavigation
