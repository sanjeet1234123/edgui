import { Avatar, Group, Stack, Title, Text, Button } from '@mantine/core'
import {
  IconCalendar,
  IconEdit,
  IconMail,
  IconSettings,
} from '@tabler/icons-react'

import classes from './accountSettings.module.css'
import { useMediaQuery } from '@mantine/hooks'
import { useGetUserDetailsQuery } from '@/hooks/queries/useUserDetailsQueries'
import moment from 'moment'

interface UserProfileHeaderProps {
  open: () => void
}

export default function UserProfileHeader({ open }: UserProfileHeaderProps) {
  const name = localStorage.getItem('name') || 'NA'
  const email = localStorage.getItem('email') || 'NA'
  const workspace = localStorage.getItem('workspace_name') || 'NA'

  // Fetch user details using the custom query hook
  const { data: userDetails } = useGetUserDetailsQuery()

  const is682px = useMediaQuery('(max-width: 682px)')
  return (
    <Group justify="space-between" mt="xl">
      {/* Left Section */}
      <Group>
        <Avatar name={name} color="var(--clr-header-headings)" size="xl" />
        <Stack gap={0}>
          <Title order={2} c="var(--clr-header-headings)">
            {name}
          </Title>
          <Group gap={5}>
            <IconMail size={18} className={classes.labels} />
            <Text className={classes.labels}>{email}</Text>
          </Group>
          <Group gap={5}>
            <IconSettings size={18} className={classes.labels} />
            <Text className={classes.labels}>{workspace}</Text>
          </Group>
        </Stack>
      </Group>
      {/* Right section */}
      <Stack
        align={is682px ? 'flex-start' : 'flex-end'}
        gap={is682px ? 'xs' : 'sm'}
      >
        <Group gap={5}>
          <IconCalendar size={18} className={classes.labels} />
          <Text className={classes.labels}>
            Joined on{'  '}
            {moment
              .unix(userDetails.account.CreationDate)
              .format('MMM DD, YYYY')}
          </Text>
        </Group>
        <Button
          size="xs"
          fz="var(--size-sm)"
          className={classes.editProfileBtn}
          leftSection={<IconEdit stroke={1.5} size={18} />}
          variant="default"
          onClick={open}
        >
          Reset Password
        </Button>
      </Stack>
    </Group>
  )
}
