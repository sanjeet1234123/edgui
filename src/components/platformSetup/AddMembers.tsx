import { useState, useEffect } from 'react'
import { Stack, Title, Button, Group, Text } from '@mantine/core'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import classes from './platformSetup.module.css'
import TeamMember from './teamMember'
import { showNotification } from '@/utils/notification'
import { useInviteMembersMutation } from '@/hooks/mutations/usePlatformSetupMutations'

type AddMembersProps = {
  onMembersInvited: (success: boolean) => void
  parentIsInviting: boolean
  membersInvited: boolean
}

interface TeamMemberType {
  id: number
  email: string
  role: string
  emailError: string
  roleError: string
}

interface InviteResult {
  email: string
  role: string
  message?: string
}

interface InviteResultsType {
  successful: InviteResult[]
  failed: InviteResult[]
}

function AddMembers({
  onMembersInvited,
  parentIsInviting,
  membersInvited,
}: AddMembersProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([
    { id: 1, email: '', role: 'Member', emailError: '', roleError: '' },
  ])
  const [inviteResults, setInviteResults] = useState<InviteResultsType>({
    successful: [],
    failed: [],
  })
  const [showResults, setShowResults] = useState(false)

  const { mutate: inviteMembers } = useInviteMembersMutation()

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        id: Date.now(),
        email: '',
        role: 'Member',
        emailError: '',
        roleError: '',
      },
    ])
  }

  const removeTeamMember = (id: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((member) => member.id !== id))
    }
  }

  const updateTeamMember = (id: number, field: string, value: string) => {
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === id) {
          const updatedMember = { ...member, [field]: value }

          // Clear errors when field is updated
          if (field === 'email') {
            updatedMember.emailError = ''
          } else if (field === 'role') {
            updatedMember.roleError = ''
          }

          return updatedMember
        }
        return member
      }),
    )
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkDuplicateEmails = () => {
    const emailMap = new Map()
    let hasDuplicates = false

    teamMembers.forEach((member) => {
      const email = member.email.trim().toLowerCase()
      if (email && emailMap.has(email)) {
        // Mark both current and previous occurrence as duplicates
        const duplicateId = emailMap.get(email)
        setTeamMembers((prev) =>
          prev.map((m) => {
            if (m.id === duplicateId || m.id === member.id) {
              return {
                ...m,
                emailError: 'Duplicate email address with different roles',
              }
            }
            return m
          }),
        )
        hasDuplicates = true
      } else {
        emailMap.set(email, member.id)
      }
    })

    return !hasDuplicates
  }

  // Validate members before inviting
  const validateMembers = () => {
    let isValid = true
    const validatedMembers = teamMembers.map((member) => {
      const memberCopy = { ...member }

      // Validate email
      if (!member.email.trim()) {
        memberCopy.emailError = 'Email is required'
        isValid = false
      } else if (!validateEmail(member.email)) {
        memberCopy.emailError = 'Invalid email format'
        isValid = false
      } else {
        memberCopy.emailError = ''
      }

      // Validate role
      if (!member.role) {
        memberCopy.roleError = 'Role is required'
        isValid = false
      } else {
        memberCopy.roleError = ''
      }

      return memberCopy
    })

    setTeamMembers(validatedMembers)
    return isValid
  }

  const handleInviteMembers = () => {
    // Check for duplicate emails first
    if (!checkDuplicateEmails()) {
      showNotification(
        'error',
        'Please remove duplicate email addresses before inviting members.',
      )
      onMembersInvited(false)
      return
    }

    // Validate all member inputs before submitting
    if (!validateMembers()) {
      showNotification(
        'error',
        'Please enter a valid email and select a role before inviting members.',
      )
      onMembersInvited(false)
      return
    }

    // Format the payload for the API exactly as required
    const membersToInvite = teamMembers.map((member) => ({
      email: member.email,
      role: member.role,
      duplicate: false,
    }))

    // Call the API with the correctly formatted payload
    inviteMembers(membersToInvite, {
      onSuccess: (data) => {
        if (!data.error) {
          // Format successful and failed invites
          const successful = data.status.add || []
          const failed = data.status.not_add || []

          setInviteResults({
            successful,
            failed,
          })
          setShowResults(true)

          if (successful.length > 0) {
            showNotification(
              'success',
              `Successfully invited ${successful.length} member(s)`,
            )

            // Notify parent component of successful invites
            onMembersInvited(true)

            // Clear form if there were successful invites
            setTeamMembers([
              {
                id: Date.now(),
                email: '',
                role: 'Member',
                emailError: '',
                roleError: '',
              },
            ])
          } else {
            // No successful invites
            onMembersInvited(false)
          }
        } else {
          // API returned an error
          onMembersInvited(false)
        }
      },
      onError: () => {
        showNotification('error', 'Failed to invite members. Please try again')
        onMembersInvited(false)
      },
    })
  }

  // Listen for parent component triggering an invite action
  useEffect(() => {
    if (parentIsInviting) {
      handleInviteMembers()
    }
  }, [parentIsInviting])

  return (
    <Stack gap="xl">
      <Title
        c="#000000"
        fz={{ base: 'var(--size-xl)', sm: 'var(--size-2xl)' }}
        fw="500"
      >
        Invite People to workspace
      </Title>

      <Stack w={{ base: '100%', md: '70%', lg: '60%', xl: '50%' }}>
        {teamMembers.map((member, index) => (
          <TeamMember
            key={index}
            id={member.id.toString()}
            name={member.email}
            role={member.role}
            emailError={member.emailError}
            roleError={member.roleError}
            onDelete={(id: string) => removeTeamMember(Number(id))}
            onChange={(id, field, value) => {
              // Map 'name' field to 'email' for consistency with API
              if (field === 'name') {
                updateTeamMember(Number(id), 'email', value)
              } else {
                updateTeamMember(Number(id), field, value)
              }
            }}
            canDelete={teamMembers.length > 1}
          />
        ))}
      </Stack>

      {showResults && (
        <Stack mt="md">
          {inviteResults.successful.length > 0 && (
            <Stack gap="xs">
              <Text fw={500} size="var(--size-lg)" c="green">
                Successfully invited:
              </Text>
              {inviteResults.successful.map((invite, index) => (
                <Text key={index} size="var(--size-base)">
                  {invite.email} ({invite.role})
                </Text>
              ))}
            </Stack>
          )}

          {inviteResults.failed.length > 0 && (
            <Stack gap="xs" mt="sm">
              <Text fw={500} size="var(--size-lg)" c="red">
                Could not invite:
              </Text>
              {inviteResults.failed.map((invite, index) => (
                <Text key={index} size="var(--size-base)">
                  {invite.email} - {invite.message}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      )}

      {!membersInvited && (
        <Group w={{ base: '100%', md: '70%', lg: '60%', xl: '50%' }} justify="flex-start">
          <Button
            p={0}
            size="xl"
            variant="transparent"
            leftSection={<IconCirclePlusFilled size={42} color="#001F63" />}
            classNames={{
              label: classes.addMembersButton,
            }}
            onClick={addTeamMember}
          >
            Add More Members
          </Button>
        </Group>
      )}
    </Stack>
  )
}

export default AddMembers
