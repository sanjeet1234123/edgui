import { useRef, useState } from 'react'
import {
  Button,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconStack } from '@tabler/icons-react'
import classes from './modal.module.css'
import SelectTrustedEntity from './AWSModal/SelectTrustedEntity'
import AssignPermissions from './AWSModal/AssignPermissions'
import SelectInstances from './AWSModal/SelectInstances'
import ConfigureAccount from './AWSModal/ConfigureAccount'
import type { AssignPermissionsRef } from './AWSModal/AssignPermissions'
import useAddClusterStore from '@/store/addClusterStore'
import { useRegisterClusterMutation } from '@/hooks/mutations/useAddClusterMutations'

const USER_ID = localStorage.getItem('user_id')

type AWSModalProps = {
  opened: boolean
  close: () => void
}

function AWSModal({ opened, close }: AWSModalProps) {
  const is1440 = useMediaQuery('(max-width: 1440px)')
  const is1024 = useMediaQuery('(max-width: 1024px)')

  const [active, setActive] = useState(0)
  const [selectedVMS, setSelectedVMS] = useState('')
  const { accountId } = useAddClusterStore()

  const assignPermissionsRef = useRef<AssignPermissionsRef>(null)

  const { mutate: registerCluster, isPending: isRegistering } =
    useRegisterClusterMutation()

  const nextStep = async () => {
    // For the Assign Permissions step
    if (active === 1 && assignPermissionsRef.current) {
      const isValid = assignPermissionsRef.current.validateForm()

      if (!isValid) {
        return // Don't proceed if validation fails
      }

      const success = await assignPermissionsRef.current.submitForm()
      if (success) {
        // Only proceed to next step if submission was successful
        setActive(active + 1)
      }
      return
    }

    if (active === 2) {
      // If no instance is selected, don't proceed
      if (selectedVMS === '') {
        return
      }

      registerCluster(
        {
          cluster_name: selectedVMS,
          user_id: Number(USER_ID),
          account_id: accountId,
        },
        {
          onSuccess: () => {
            // If the cluster is registered successfully, proceed to the next step
            setActive(active + 1)
          },
        },
      )
    }

    // For other steps, proceed normally
    if (active < 4) {
      setActive(active + 1)
    }
  }

  const backStep = () => {
    if (active > 0) {
      setActive(active - 1)
    }
  }

  return (
    <Modal
      size={is1024 ? '95vw' : is1440 ? '80vw' : '70vw'}
      opened={opened}
      onClose={close}
      title={
        <Group>
          <ThemeIcon
            variant="outline"
            color="gray"
            size="xl"
            radius="md"
            styles={{ root: { borderColor: 'var(--mantine-color-gray-3)' } }}
          >
            <IconStack size={32} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fz="var(--size-xl)" fw={600}>
              AWS Account Onboarding
            </Text>
            <Text fz="var(--size-sm)" fw={400} c="dimmed">
              Please configure and add your AWS account
            </Text>
          </Stack>
        </Group>
      }
    >
      <Stack gap="xl">
        <Stepper
          size="sm"
          color="#20C374"
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
          classNames={classes}
        >
          {[
            {
              label: 'Select Trusted Entity',
              content: <SelectTrustedEntity />,
            },
            {
              label: 'Assign Permissions',
              content: <AssignPermissions ref={assignPermissionsRef} />,
            },
            {
              label: 'Select Instances',
              content: (
                <SelectInstances
                  selectedVMS={selectedVMS}
                  setSelectedVMS={setSelectedVMS}
                />
              ),
            },
            {
              label: 'Configure Account',
              content: <ConfigureAccount />,
            },
          ].map((step, index) => (
            <Stepper.Step
              key={index}
              label={step.label}
              allowStepSelect={false}
            >
              {step.content}
            </Stepper.Step>
          ))}
          <Stepper.Completed>
            <Text fw="500" ta="center" size="var(--size-xl)" c="#000000">
              Completed
            </Text>
          </Stepper.Completed>
        </Stepper>

        <Group justify="flex-end">
          {active > 0 && (
            <Button
              size="md"
              variant="outline"
              color="var(--mantine-color-gray-7)"
              onClick={backStep}
            >
              Back
            </Button>
          )}

          <Button size="md" onClick={nextStep} loading={isRegistering}>
            Proceed Next
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default AWSModal
