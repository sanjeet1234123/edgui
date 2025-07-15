import { Stack, Tabs } from '@mantine/core'
import { IconSettings, IconUser, IconUsers } from '@tabler/icons-react'
import classes from './accountSettings.module.css'
import UserDetails from './UserDetails'
import WorkspaceDetails from './WorkspaceDetails'
import ProjectDetails from './ProjectDetails'
import { useGetProjectsQuery } from '@/hooks/queries/useProjectsQueries'

import { useMediaQuery } from '@mantine/hooks'

export default function AccountSettingsBody() {
  const { data: projects, isLoading } = useGetProjectsQuery()

  const is1024px = useMediaQuery('(max-width: 1024px)')

  const tabs = [
    {
      value: 'user-details',
      icon: IconUser,
      label: 'User Details',
      component: <UserDetails />,
    },
    {
      value: 'workspace',
      icon: IconSettings,
      label: 'Workspace',
      component: <WorkspaceDetails />,
    },
    {
      value: 'projects',
      icon: IconUsers,
      label: 'My projects',
      component: <ProjectDetails data={projects} isLoading={isLoading} />,
    },
  ]

  return (
    <Stack>
      <Tabs
        className={classes.tabSection}
        classNames={{
          tab: classes.tab,
          panel: classes.panel,
          list: classes.list,
        }}
        variant="pills"
        orientation={is1024px ? 'horizontal' : 'vertical'}
        defaultValue="user-details"
      >
        <Tabs.List>
          {tabs.map(tab => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              leftSection={<tab.icon size={22} />}
              size="lg"
              color="var(--clr-tabs-tab-bg)"
              fw="var(--font-weight-medium)"
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map(tab => (
          <Tabs.Panel
            key={tab.value}
            value={tab.value}
            ps={is1024px ? 0 : '2rem'}
            pt={is1024px ? '1rem' : 0}
          >
            {tab.component}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
