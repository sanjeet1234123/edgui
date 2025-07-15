import { useState } from 'react'
import { Button, Card, Grid, Group, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown } from '@tabler/icons-react'
import ManagedNexastackModal from './Modals/ManagedNexastackModal'
import OnPremisesModal from './Modals/OnPremisesModal'
import AWSModal from './Modals/AWSModal'
import GCPModal from './Modals/GCPModal'
import AzureModal from './Modals/AzureModal'
import classes from './addCluster.module.css'
import MachineIcon from '@/assets/logos/add-cluster-machine.svg?react'
import CloudIcon from '@/assets/logos/add-cluster-cloud.svg?react'
import NexastackGrayIcon from '@/assets/logos/Nexastack-GrayOut.svg?react'

const ONBOARD_TYPE = {
  ON_PREMISES: 'on-premises',
  CLOUD: 'cloud',
  MANAGED_NEXASTACK: 'managed-nexaStack',
}

const CLOUD_TYPE = {
  AWS: 'AWS EKS',
  GCP: 'GCP GKE',
  AZURE: 'AZURE AKS',
}

function AddClusterCards() {
  const [selectedType, setSelectedType] = useState<string>(
    ONBOARD_TYPE.ON_PREMISES,
  )
  const [selectedCloud, setSelectedCloud] = useState<string>(CLOUD_TYPE.AWS)

  const [onPremisesOpened, { open: openOnPremises, close: closeOnPremises }] =
    useDisclosure(false)
  const [
    managedNexastackOpened,
    { open: openManagedNexastack, close: closeManagedNexastack },
  ] = useDisclosure(false)
  const [awsOpened, { open: openAws, close: closeAws }] = useDisclosure(false)
  const [gcpOpened, { open: openGcp, close: closeGcp }] = useDisclosure(false)
  const [azureOpened, { open: openAzure, close: closeAzure }] =
    useDisclosure(false)

  const handleToggleType = (type: string) => {
    setSelectedType(type)
  }

  return (
    <>
      <Stack className="flex-grow">
        {/* Onboard type cards */}
        <Grid gutter="xl" mb="xl">
          {[
            {
              type: ONBOARD_TYPE.ON_PREMISES,
              icon: MachineIcon,
              title: 'On-Premises',
              description:
                'Deploy optimization agents on your kubernetes cluster with existing infrastructure and specific security requirements.',
            },
            {
              type: ONBOARD_TYPE.CLOUD,
              icon: CloudIcon,
              title: 'Cloud',
              description:
                'Deploy in our secure cloud environment. Faster implementation with automatic updates and scalable resources.',
            },
            {
              type: ONBOARD_TYPE.MANAGED_NEXASTACK,
              icon: NexastackGrayIcon,
              title: 'Managed by Nexastack',
              description:
                'Let Nexastack manage your Kubernetes infrastructure with fully-managed cluster deployment, monitoring, and maintenance.',
            },
          ].map((item) => (
            <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={item.type}>
              <Card
                h="100%"
                padding="xl"
                shadow="md"
                classNames={{
                  root: `${classes.cardStyle} ${
                    selectedType === item.type ? classes.selectedCard : ''
                  }`,
                }}
                onClick={() => handleToggleType(item.type)}
              >
                <Stack gap="xl">
                  <item.icon className={classes.imageStyle} />
                  <Stack gap="xs">
                    <Text
                      fw={600}
                      fz="var(--size-xl)"
                      c="var(--clr-add-cluster-card-title)"
                    >
                      {item.title}
                    </Text>
                    <Text
                      lineClamp={3}
                      c="var(--clr-add-cluster-card-description)"
                    >
                      {item.description}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Onboard type based buttons */}
        <Group>
          {selectedType === ONBOARD_TYPE.CLOUD && (
            <Stack>
              <Select
                size="md"
                label="Please select the cloud provider"
                value={selectedCloud}
                onChange={(value) => setSelectedCloud(value as string)}
                defaultValue={CLOUD_TYPE.AWS}
                allowDeselect={false}
                data={[
                  { label: 'AWS EKS', value: CLOUD_TYPE.AWS },
                  { label: 'GCP GKE', value: CLOUD_TYPE.GCP },
                  { label: 'AZURE AKS', value: CLOUD_TYPE.AZURE },
                ]}
                rightSection={<IconChevronDown size={16} />}
              />

              {selectedCloud === CLOUD_TYPE.AZURE && (
                <Button size="md" onClick={openAzure}>
                  Connect to Azure Account
                </Button>
              )}
              {selectedCloud === CLOUD_TYPE.AWS && (
                <Button size="md" onClick={openAws}>
                  Connect to AWS Account
                </Button>
              )}
              {selectedCloud === CLOUD_TYPE.GCP && (
                <Button size="md" onClick={openGcp}>
                  Connect to GCP Account
                </Button>
              )}
            </Stack>
          )}

          {selectedType === ONBOARD_TYPE.ON_PREMISES && (
            <Button size="md" onClick={openOnPremises}>
              Upload Kubeconfig
            </Button>
          )}

          {selectedType === ONBOARD_TYPE.MANAGED_NEXASTACK && (
            <Button size="md" onClick={openManagedNexastack}>
              Managed Kubernetes (By Nexastack)
            </Button>
          )}
        </Group>
      </Stack>

      {/* On-Premises Modal */}
      {onPremisesOpened && (
        <OnPremisesModal opened={onPremisesOpened} close={closeOnPremises} />
      )}

      {/* AWS Modal */}
      {awsOpened && <AWSModal opened={awsOpened} close={closeAws} />}

      {/* GCP Modal */}
      {gcpOpened && <GCPModal opened={gcpOpened} close={closeGcp} />}

      {/* Azure Modal */}
      {azureOpened && <AzureModal opened={azureOpened} close={closeAzure} />}

      {/* Managed Nexastack Modal */}
      {managedNexastackOpened && (
        <ManagedNexastackModal
          opened={managedNexastackOpened}
          close={closeManagedNexastack}
        />
      )}
    </>
  )
}

export default AddClusterCards
