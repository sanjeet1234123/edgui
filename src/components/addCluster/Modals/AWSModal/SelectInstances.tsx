import { Radio, Stack, Text } from '@mantine/core'
import useAddClusterStore from '@/store/addClusterStore'

type SelectInstancesProps = {
  selectedVMS: string
  setSelectedVMS: (value: string) => void
}

function SelectInstances({
  selectedVMS,
  setSelectedVMS,
}: SelectInstancesProps) {
  const { vms } = useAddClusterStore()

  return (
    <Stack>
      <Stack align="center" gap={0}>
        <Text fz="var(--size-xl)" fw={600}>
          Select Cluster to Onboard
        </Text>
        <Text fz="var(--size-sm)" fw={400} c="dimmed">
          Please select the cluster you want to onboard and onboard seamlessly
        </Text>
      </Stack>

      <Radio.Group value={selectedVMS} onChange={setSelectedVMS}>
        <Stack>
          {vms.length > 0 ? (
            vms.map((item, index) => (
              <Radio key={index} label={item.vm} value={item.vm} />
            ))
          ) : (
            <Text fz="var(--size-sm)" fw={400}>
              You don't have clusters, please add one
            </Text>
          )}
        </Stack>
      </Radio.Group>
    </Stack>
  )
}

export default SelectInstances
