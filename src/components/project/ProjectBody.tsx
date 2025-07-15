import { useState } from 'react'
import { Group, SegmentedControl } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import classes from './project.module.css'
import Overview from './overview/Overview'
import Environments from './Environments'
import Settings from './Settings'
import Members from './Members'
import Activity from './Activity'

function ProjectBody() {
  const [activeTab, setActiveTab] = useState('overview')
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  return (
    <>
      <Group>
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          withItemsBorders={false}
          size={is1024 ? 'sm' : 'md'}
          radius="md"
          orientation={is768 ? 'vertical' : 'horizontal'}
          data={[
            { label: 'Overview', value: 'overview' },
            {
              label: 'Environments',
              value: 'environments',
              disabled: true,
            },
            { label: 'Members', value: 'members' },
            { label: 'Settings', value: 'settings', disabled: true },
            { label: 'Activity', value: 'activity' },
          ]}
          classNames={{
            label: classes.segmentedControlLabel,
            root: classes.segmentedControlRoot,
          }}
        />
      </Group>

      {activeTab === 'overview' && <Overview />}
      {activeTab === 'environments' && <Environments />}
      {activeTab === 'members' && <Members />}
      {activeTab === 'settings' && <Settings />}
      {activeTab === 'activity' && <Activity />}
    </>
  )
}

export default ProjectBody
