import { Grid } from '@mantine/core'
import ProjectDetails from './ProjectDetails'
import TeamMembers from './TeamMembers'
import Environments from './Environments'
import RecentActivity from './RecentActivity'

function Overview() {
  return (
    <Grid gutter="xl">
      {/* Project Details */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <ProjectDetails />
      </Grid.Col>
      {/* Team Members */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <TeamMembers />
      </Grid.Col>

      {/* Environments */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Environments />
      </Grid.Col>

      {/* Recent Activity */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <RecentActivity />
      </Grid.Col>
    </Grid>
  )
}

export default Overview
