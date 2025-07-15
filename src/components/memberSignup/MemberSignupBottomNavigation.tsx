import { Link } from '@tanstack/react-router'
import { Stack, Text } from '@mantine/core'
import { PATHS } from '@/constants/paths'
import classes from './memberSignup.module.css'

function MemberSignupBottomNavigation() {
  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Already have an account?{' '}
        <Link
          to={PATHS.MEMBER_LOGIN}
          search={{ ws: sessionStorage.getItem('member_workspace') as string }}
          viewTransition
          className={classes.linkText}
        >
          Login here
        </Link>
      </Text>

      <Text size="sm" className={classes.accountText}>
        Want to signup to another workspace?{' '}
        <Link to={PATHS.SIGNUP} viewTransition className={classes.linkText}>
          Signup here
        </Link>
      </Text>
    </Stack>
  )
}

export default MemberSignupBottomNavigation
