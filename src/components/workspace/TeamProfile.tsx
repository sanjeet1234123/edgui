import { Grid } from '@mantine/core'
import WorkspaceDetails from './TeamProfile/WorkspaceDetails'
import WorkspaceMembers from './TeamProfile/WorkspaceMembers'

function TeamProfile() {
  return (
    <Grid gutter="xl">
      {/* Workspace Details */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <WorkspaceDetails />
      </Grid.Col>

      {/* Team Members */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <WorkspaceMembers />
      </Grid.Col>
    </Grid>
  )
}

export default TeamProfile
