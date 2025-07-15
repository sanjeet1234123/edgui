import { Link } from '@tanstack/react-router'
import { Stack, Text } from '@mantine/core'
import { PATHS } from '@/constants/paths'
import classes from './projectMemberRegistration.module.css'

function ProjectMemberRegistrationFooter() {
  return (
    <Stack>
      <Text size="sm" className={classes.accountText}>
        Already registered?{' '}
        <Link to={PATHS.LOGIN} viewTransition className={classes.linkText}>
          Login here
        </Link>
      </Text>
    </Stack>
  )
}

export default ProjectMemberRegistrationFooter
