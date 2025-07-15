import { useState } from 'react'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Button, Group, Stack, Stepper, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import classes from './platformSetup.module.css'
import TeamDetails from './TeamDetails'
import WorkspaceCreation from './WorkspaceCreation'
import AddMembers from './AddMembers'
import CompleteModal from './CompleteModal'
import type { PlatformSetupForm } from '@/types/platformSetupType'
import { showNotification } from '@/utils/notification'

const platformSetupSchema = z.object({
  team_name: z.string().min(1, 'Team name is required'),
  team_type: z.string().min(1, 'Team type is required'),
  team_size: z.string().min(1, 'Team size is required'),
})

function PlatformSetupStepper() {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const [active, setActive] = useState(0)
  const [modalOpened, setModalOpened] = useState(false)
  const [isWorkspaceCreated, setIsWorkspaceCreated] = useState(false)
  const [membersInvited, setMembersInvited] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  // Setup Form
  const form = useForm<PlatformSetupForm>({
    initialValues: {
      workspace_url: '',
      team_name: '',
      team_type: '',
      team_size: '',
    },
    validate: zodResolver(platformSetupSchema),
  })

  // Handle members invited
  const handleMembersInvited = (success: boolean) => {
    if (success) {
      setMembersInvited(true)
    }
    setIsInviting(false)
  }

  // Stepper Step Data
  const stepperData = [
    {
      label: 'Team Details',
      description: 'Setup Team and manage ',
      content: <TeamDetails form={form} />,
    },
    {
      label: 'WorkSpace Creation',
      description: 'Create and setup your workspace',
      content: (
        <WorkspaceCreation
          form={form}
          onWorkspaceCreated={() => setIsWorkspaceCreated(true)}
        />
      ),
    },
    {
      label: 'Add Members',
      description: 'Add members to your workspace',
      content: (
        <AddMembers
          onMembersInvited={handleMembersInvited}
          membersInvited={membersInvited}
          parentIsInviting={isInviting}
        />
      ),
    },
  ]

  // Handle the next step
  const nextStep = () => {
    const nextActive = active + 1

    // Check if we're on the Team Details step (step 0)
    if (active === 0) {
      // Validate team details form
      const validation = form.validate()
      if (validation.hasErrors) {
        return // Don't proceed if form is invalid
      }
    }

    // Check if we're on the Workspace Creation step (step 1)
    if (active === 1 && !isWorkspaceCreated) {
      showNotification('error', 'Please create a workspace before proceeding')
      return // Don't proceed if workspace isn't created
    }

    // If on the Add Members step, handle invitation instead of proceeding
    if (active === 2 && !membersInvited) {
      // Trigger the invite action in the AddMembers component
      setIsInviting(true)
      return
    }

    // If all checks pass, proceed to next step
    if (nextActive < stepperData.length) {
      setActive(nextActive)
    } else if (nextActive === stepperData.length) {
      setActive(nextActive)
      setModalOpened(true)
    }
  }

  // Determine the button text for the next button
  const getNextButtonText = () => {
    if (active === 2) {
      return membersInvited ? 'Proceed Next' : 'Invite Members'
    }
    return 'Proceed Next'
  }

  return (
    <>
      <Stack h="100%" gap="xl" justify="space-between">
        {/* Stepper */}
        <Stepper
          size="sm"
          color="#20C374"
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
          orientation={is1024 ? 'vertical' : 'horizontal'}
          classNames={classes}
        >
          {stepperData.map((step) => (
            <Stepper.Step
              key={step.label}
              label={step.label}
              description={step.description}
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

        {/* Stepper Navigation Button */}
        <Group justify="flex-end" align="center" mt="xl">
          {active === 2 && (
            <Button
              size={is768 ? 'md' : 'lg'}
              variant="transparent"
              onClick={() => {
                setActive(3)
                setModalOpened(true)
              }}
            >
              Skip for now
            </Button>
          )}

          <Button
            size={is768 ? 'md' : 'lg'}
            onClick={nextStep}
            loading={active === 2 && isInviting}
            disabled={
              active === 0
                ? form.values.team_name === '' ||
                  form.values.team_size === '' ||
                  form.values.team_type === ''
                : active === 1
                  ? form.values.workspace_url === '' || !isWorkspaceCreated
                  : false
            }
          >
            {getNextButtonText()}
          </Button>
        </Group>
        {modalOpened && <CompleteModal opened={modalOpened} />}
      </Stack>
    </>
  )
}

export default PlatformSetupStepper
