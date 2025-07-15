import {
  Modal,
  Stack,
  Title,
  Text,
  PasswordInput,
  Button,
  Divider,
  Popover,
  Progress,
} from '@mantine/core'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { getStrength } from '@/utils/commonFunction'
import PasswordRequirement from './PasswordRequirement'
import type { ChangePasswordForm } from '@/types/accountDetailsType'
import { useForm } from '@mantine/form'
import { useChangePasswordMutation } from '@/hooks/mutations/useUserDetailsMutations'

interface ChangePasswordProps {
  close: () => void
  opened: boolean
}

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
]

export default function ChangePassword({ close, opened }: ChangePasswordProps) {
  const { mutate: changePassword, isPending } = useChangePasswordMutation()
  const [popoverOpened, setPopoverOpened] = useState(false)

  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, 'Enter your current password'),
      newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[0-9]/, 'Password must include at least one number')
        .regex(/[a-z]/, 'Password must include at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
        .regex(
          /[$&+,:;=?@#|'<>.^*()%!-]/,
          'Password must include at least one special symbol',
        ),
      confirmPassword: z.string().min(1, 'Confirm your new password'),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    })

  const form = useForm<ChangePasswordForm>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: zodResolver(changePasswordSchema),
  })

  // Get the new password value from form for strength checking
  const newPasswordValue = form.values.newPassword

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(newPasswordValue)}
    />
  ))

  const strength = getStrength(newPasswordValue)
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red'

  const handleChangePasswordSubmit = (values: ChangePasswordForm) => {
    const data = {
      old_password: values.currentPassword,
      new_password: values.newPassword,
    }
    changePassword(data, {
      onSuccess: () => {
        form.reset()
        close()
      },
    })
  }

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={close}
      title={
        <Stack gap={0}>
          <Title order={3} c="var(--clr-header-headings)" fw={600}>
            Change Password
          </Title>
          <Text>Update your password</Text>
        </Stack>
      }
      centered
      styles={{
        title: { width: '100%' },
        header: { alignItems: 'flex-start' },
      }}
    >
      <form onSubmit={form.onSubmit(handleChangePasswordSubmit)}>
        <Stack>
          {/* Input Old Password */}
          <PasswordInput
            withAsterisk
            label="Current Password"
            placeholder="Enter your current password"
            {...form.getInputProps('currentPassword')}
          />

          {/* Input New Password */}
          <Popover
            opened={popoverOpened}
            position="bottom"
            width="target"
            transitionProps={{ transition: 'pop' }}
          >
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  withAsterisk
                  label="New Password"
                  placeholder="Enter your new password"
                  {...form.getInputProps('newPassword')}
                />
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Progress color={color} value={strength} size={5} mb="xs" />
              <PasswordRequirement
                label="Includes at least 6 characters"
                meets={newPasswordValue.length > 5}
              />
              {checks}
            </Popover.Dropdown>
          </Popover>

          {/* Confirm New Password */}
          <PasswordInput
            withAsterisk
            label="Confirm Password"
            placeholder="Confirm your new password"
            {...form.getInputProps('confirmPassword')}
          />

          <Divider />
          <Button type="submit" fw={500} disabled={isPending}>
            Change Password
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}
