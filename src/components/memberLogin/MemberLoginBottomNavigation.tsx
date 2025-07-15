import { Link } from '@tanstack/react-router'
import { Stack, Text } from '@mantine/core'
import { PATHS } from '@/constants/paths'
import classes from './memberLogin.module.css'

function MemberLoginBottomNavigation() {
  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Do not have an Account?{' '}
        <Link
          to={PATHS.MEMBER_SIGNUP}
          viewTransition
          className={classes.linkText}
        >
          Signup to {sessionStorage.getItem('member_workspace')} workspace
        </Link>
      </Text>

      <Text size="sm" className={classes.accountText}>
        Want to login to another workspace?{' '}
        <Link to={PATHS.LOGIN} viewTransition className={classes.linkText}>
          Click here
        </Link>
      </Text>
    </Stack>
  )
}

export default MemberLoginBottomNavigation
