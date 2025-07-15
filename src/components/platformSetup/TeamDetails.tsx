import { useState } from 'react'
import { Select, Stack, Text, TextInput } from '@mantine/core'
import type { ComboboxItem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronDown } from '@tabler/icons-react'
import classes from './platformSetup.module.css'
import { teamSizeOptions, teamTypeOptions } from './constant'
import type { UseFormReturnType } from '@mantine/form'
import type { PlatformSetupForm } from '@/types/platformSetupType'

function TeamDetails({ form }: { form: UseFormReturnType<PlatformSetupForm> }) {
  const is768 = useMediaQuery('(max-width: 768px)')
  const [teamSize, setTeamSize] = useState(form.values.team_size || null)
  const [selectedTeamType, setSelectedTeamType] = useState<ComboboxItem | null>(
    form.values.team_type
      ? teamTypeOptions.find(
          (option) => option.value === form.values.team_type,
        ) || null
      : null,
  )

  const handleTeamSizeChange = (size: string) => {
    setTeamSize(size)
    form.setFieldValue('team_size', size)
  }

  return (
    <Stack gap="xl">
      <TextInput
        size={is768 ? 'md' : 'lg'}
        label="Team Name"
        placeholder="Please enter your Team Name"
        classNames={classes}
        {...form.getInputProps('team_name')}
        required
      />

      <Stack gap={0}>
        <Text className={classes.label}>
          How many people are there in your Team{' '}
          <span className={classes.required}>*</span>
        </Text>
        <div className={classes.teamSizeOptionsWrapper}>
          {teamSizeOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleTeamSizeChange(option.value)}
              className={`${classes.teamSizeOption} ${
                teamSize === option.value ? classes.teamSizeOptionSelected : ''
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
        {form.errors.team_size && (
          <Text className={classes.error}>{form.errors.team_size}</Text>
        )}
      </Stack>

      <Select
        size={is768 ? 'md' : 'lg'}
        label="What does your Team do?"
        placeholder="Please select Type"
        data={teamTypeOptions}
        rightSection={<IconChevronDown size={20} />}
        classNames={classes}
        value={selectedTeamType ? selectedTeamType.value : null}
        onChange={(_value, option) => {
          setSelectedTeamType(option)
          if (option) {
            form.setFieldValue('team_type', option.value)
          }
        }}
        required
      />
    </Stack>
  )
}

export default TeamDetails
