import { useState } from 'react'
import { Group, SegmentedControl } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import classes from './workspace.module.css'
import Members from './Members'
import TeamProfile from './TeamProfile'

function WorkspaceBody() {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const [activeTab, setActiveTab] = useState('team_profile')

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
            { label: 'Team Profile', value: 'team_profile' },
            { label: 'Members', value: 'members' },
          ]}
          classNames={{
            label: classes.segmentedControlLabel,
            root: classes.segmentedControlRoot,
          }}
        />
      </Group>
      {activeTab === 'team_profile' && <TeamProfile />}
      {activeTab === 'members' && <Members />}
    </>
  )
}
export default WorkspaceBody
