import { useState } from 'react'
import { TextInput, Select, Group, ActionIcon } from '@mantine/core'
import type { ComboboxItem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronDown, IconTrash } from '@tabler/icons-react'
import classes from './platformSetup.module.css'

type TeamMemberProps = {
  id: string
  name: string
  role: string
  emailError: string
  roleError: string
  onDelete: (id: string) => void
  onChange: (id: string, field: string, value: string) => void
  canDelete: boolean
}

function TeamMember({
  id,
  name,
  role,
  emailError,
  roleError,
  onDelete,
  onChange,
  canDelete,
}: TeamMemberProps) {
  const is640 = useMediaQuery('(max-width: 640px)')

  const [showTrash, setShowTrash] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ComboboxItem | null>(
    role ? { value: role, label: role === 'Admin' ? 'Admin' : 'Member' } : null,
  )

  const handleDelete = () => {
    if (canDelete) {
      onDelete(id)
    }
  }

  return (
    <Group
      onMouseEnter={() => setShowTrash(true)}
      onMouseLeave={() => setShowTrash(false)}
    >
      <Group
        gap="xl"
        grow
        preventGrowOverflow={false}
        wrap="nowrap"
        style={{ flex: 1, flexDirection: is640 ? 'column' : 'row' }}
        align="flex-start"
      >
        <TextInput
          size="lg"
          placeholder="Email address"
          classNames={classes}
          w={is640 ? '100%' : showTrash && canDelete ? '55%' : '60%'}
          value={name}
          styles={{ wrapper: { width: '100%' } }}
          onChange={(e) => onChange(id, 'name', e.target.value)}
          style={{
            transition: 'width 0.3s ease-in-out',
          }}
          type="email"
          error={emailError}
        />
        <Select
          size="lg"
          placeholder="Assign a role"
          data={[
            { value: 'Admin', label: 'Admin' },
            { value: 'Member', label: 'Member' },
          ]}
          rightSection={<IconChevronDown size={20} />}
          classNames={classes}
          value={selectedRole ? selectedRole.value : null}
          styles={{
            wrapper: { width: '100%' },
            root: { width: is640 ? '100%' : '' },
          }}
          onChange={(_value, option) => {
            setSelectedRole(option)
            if (option) {
              onChange(id, 'role', option.value)
            }
          }}
          error={roleError}
        />
      </Group>

      {canDelete && (
        <div
          className={`overflow-hidden transition-[width] duration-300 ease-in-out ml-4 ${showTrash ? 'w-14' : 'w-0'}`}
        >
          <ActionIcon
            onClick={handleDelete}
            radius="xl"
            size="xl"
            color="#001F63"
          >
            <IconTrash size={20} />
          </ActionIcon>
        </div>
      )}
    </Group>
  )
}

export default TeamMember
