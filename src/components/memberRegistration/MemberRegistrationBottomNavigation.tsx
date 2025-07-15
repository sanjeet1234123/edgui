import { Link } from '@tanstack/react-router'
import { Stack, Text } from '@mantine/core'
import { PATHS } from '@/constants/paths'
import classes from './memberRegistration.module.css'

function MemberRegistrationBottomNavigation() {
  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Already registered?{' '}
        <Link
          to={PATHS.MEMBER_LOGIN}
          search={{ ws: sessionStorage.getItem('member_workspace') as string }}
          viewTransition
          className={classes.linkText}
        >
          Login here
        </Link>
      </Text>
    </Stack>
  )
}

export default MemberRegistrationBottomNavigation
