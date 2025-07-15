import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import classes from './platformSetup.module.css'
import type { PlatformSetupForm } from '@/types/platformSetupType'
import type { UseFormReturnType } from '@mantine/form'
import {
  useCheckWorkspaceAvailabilityMutation,
  useCreateWorkspaceMutation,
} from '@/hooks/mutations/usePlatformSetupMutations'

type WorkspaceCreationProps = {
  form: UseFormReturnType<PlatformSetupForm>
  onWorkspaceCreated: () => void
}

function WorkspaceCreation({
  form,
  onWorkspaceCreated,
}: WorkspaceCreationProps) {
  const is768 = useMediaQuery('(max-width: 768px)')

  const [workspaceUrl, setWorkspaceUrl] = useState('')
  const [isWorkspaceCreated, setIsWorkspaceCreated] = useState(false)
  const debounceTimerRef = useRef<number | null>(null)

  const {
    mutate: checkAvailability,
    isPending: isCheckingAvailability,
    isError: isAvailabilityError,
    isSuccess: isAvailabilitySuccess,
    reset: resetAvailabilityCheck,
  } = useCheckWorkspaceAvailabilityMutation()

  const { mutate: createWorkspace, isPending: isCreatingWorkspace } =
    useCreateWorkspaceMutation()

  useEffect(() => {
    const lowerCaseName = form.values.team_name.toLowerCase().replace(/ /g, '-')
    setWorkspaceUrl(lowerCaseName)

    // Only check if there's a value
    if (lowerCaseName.trim()) {
      // Clear previous timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }

      // Check availability after team name changes
      debounceTimerRef.current = setTimeout(() => {
        checkAvailability({ workspace_url: lowerCaseName })
      }, 500)
    }
  }, [form.values.team_name])

  // Update form value when workspaceUrl changes
  useEffect(() => {
    form.setFieldValue('workspace_url', workspaceUrl)
  }, [workspaceUrl])

  // Handle URL input changes with debounce
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setWorkspaceUrl(newUrl)

    // Clear previous timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }

    // Only check if there's a value
    if (newUrl.trim()) {
      // Set new timer to check availability after 500ms of no typing
      debounceTimerRef.current = setTimeout(() => {
        checkAvailability({ workspace_url: newUrl })
      }, 500)
    } else {
      // Reset mutation state if input is empty
      resetAvailabilityCheck()
    }
  }

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleCreateWorkspace = () => {
    const workspaceData = {
      workspace_url: `${workspaceUrl}.nexastack.neuralcompany.work`,
      team_name: form.values.team_name,
      team_type: form.values.team_type,
      team_size: form.values.team_size,
    }

    createWorkspace(workspaceData, {
      onSuccess: () => {
        setIsWorkspaceCreated(true)
        // Notify parent component that workspace is created
        onWorkspaceCreated()
      },
    })
  }

  // Determine status messages
  const isUrlValid = workspaceUrl.trim().length > 0

  return (
    <Stack gap="lg">
      <Stack>
        <div className="flex flex-col gap-2 w-full lg:w-1/2">
          <Text className={classes.label}>
            Workspace URL <span className={classes.required}>*</span>
          </Text>

          <div className="flex flex-col md:flex-row gap-4">
            <TextInput
              size={is768 ? 'md' : 'lg'}
              placeholder="Please enter URL"
              classNames={classes}
              required
              styles={{ root: { flex: 1 }, wrapper: { width: '100%' } }}
              value={workspaceUrl}
              onChange={handleUrlChange}
              disabled={
                isCheckingAvailability ||
                isCreatingWorkspace ||
                isWorkspaceCreated
              }
            />
            <Box className={classes.exampleUrlBox}>
              <Text className={classes.exampleUrl}>
                .nexastack.neuralcompany.work
              </Text>
            </Box>
          </div>
        </div>
        <Flex align="center">
          {isCheckingAvailability && <Loader size="sm" />}
          {isAvailabilityError && (
            <Text className={classes.errorText}>Workspace already exists.</Text>
          )}
          {isAvailabilitySuccess && (
            <Text className={classes.successText}>
              Workspace is available and can be created.
            </Text>
          )}
        </Flex>
      </Stack>

      <Stack>
        <Group>
          <Button
            size={is768 ? 'md' : 'lg'}
            onClick={handleCreateWorkspace}
            disabled={
              !isUrlValid ||
              isCheckingAvailability ||
              isAvailabilityError ||
              isCreatingWorkspace ||
              isWorkspaceCreated
            }
            loading={isCreatingWorkspace}
          >
            Create Workspace
          </Button>
        </Group>
        {isCreatingWorkspace && (
          <Flex gap="xs" align="center">
            <Loader size="sm" />
            <Text>Creating your workspace...</Text>
          </Flex>
        )}
        {isWorkspaceCreated && (
          <Text className={classes.successText}>
            Workspace created successfully!
          </Text>
        )}
      </Stack>
    </Stack>
  )
}

export default WorkspaceCreation
