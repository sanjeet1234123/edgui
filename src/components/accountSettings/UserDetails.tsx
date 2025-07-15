import {
  Card,
  Text,
  Stack,
  Title,
  Badge,
  Grid,
  TextInput,
  Button,
  Input,
} from '@mantine/core'
import { IMaskInput } from 'react-imask'
import classes from './accountSettings.module.css'
import UserProfileHeader from './UserProfileHeader'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useForm } from '@mantine/form'
import type { UpdateDetailsForm } from '@/types/accountDetailsType'
import { IconFileText } from '@tabler/icons-react'
import { useUpdateUserDetailsMutation } from '@/hooks/mutations/useUserDetailsMutations'
import { useDisclosure } from '@mantine/hooks'
import ChangePassword from './ChangePassword'

export default function UserDetails() {
  const name = localStorage.getItem('name') || 'N/A'
  const email = localStorage.getItem('email') || 'N/A'
  const role = localStorage.getItem('workspace_role') || 'N/A'
  const workspace = localStorage.getItem('workspace_name') || 'N/A'
  const phone = localStorage.getItem('phone') || 'N/A'

  // If userDetails is available, use it to override localStorage values
  const { mutate: updateUserDetails, isPending } =
    useUpdateUserDetailsMutation()
  const [opened, { open, close }] = useDisclosure(false)

  const updateDetailsSchema = {
    firstname: z.string().min(1, 'First name is required'),
    lastname: z.string().min(1, 'Last name is required'),
    phone: z
      .string()
      .min(12, 'Phone number must be at least 10 digits')
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  }

  const form = useForm<UpdateDetailsForm>({
    initialValues: {
      firstname: name?.split(' ')[0] || '',
      lastname: name?.split(' ')[1] || '',
      phone: phone,
    },
    validate: zodResolver(z.object(updateDetailsSchema)),
  })

  const handleUpdateDetailsSubmit = (values: UpdateDetailsForm) => {
    const data = {
      name: `${values.firstname} ${values.lastname}`,
      phone: values.phone,
    }

    updateUserDetails(data, {
      onSuccess: () => {
        // Update localStorage
        localStorage.setItem('name', `${values.firstname} ${values.lastname}`)
        localStorage.setItem('phone', values.phone)
      },
    })
  }

  const getFieldName = (label: string): keyof UpdateDetailsForm | null => {
    switch (label) {
      case 'First Name':
        return 'firstname'
      case 'Last Name':
        return 'lastname'
      case 'Phone':
        return 'phone'
      default:
        return null
    }
  }

  const isFieldEditable = (label: string): boolean => {
    return !['Email', 'Workspace', 'Role'].includes(label)
  }

  const userInfo = [
    {
      label: 'First Name',
      value: name?.split(' ')[0] || '',
    },
    {
      label: 'Last Name',
      value: name?.split(' ')[1] || '',
    },
    {
      label: 'Email',
      value: email,
    },
    {
      label: 'Phone',
      value: phone !== 'N/A' ? phone : '',
    },
    {
      label: 'Workspace',
      value: workspace,
    },
    {
      label: 'Role',
      value: role,
    },
  ]

  return (
    <>
      <Card radius="md" w="100%">
        {/* User Details Title */}
        <Title order={3} className={classes.cardTitle}>
          User Details
        </Title>
        <Text>View or update your personal information</Text>
        <Stack h="100%" gap="xl">
          {/* User Profile Header */}
          <UserProfileHeader open={open} />
          {/* User Details */}
          <form onSubmit={form.onSubmit(handleUpdateDetailsSubmit)}>
            <Grid gutter="xl">
              {userInfo.map((info, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 6 }}>
                  <Stack gap="xs">
                    <Title
                      fz="var(--size-sm)"
                      fw={500}
                      c="var(--clr-header-labels)"
                    >
                      {info.label}
                    </Title>
                    {info.label === 'Role' ? (
                      <Badge
                        size="lg"
                        color="var(--mantine-color-black)"
                        variant={
                          role.toLowerCase() === 'owner' ? 'filled' : 'outline'
                        }
                        classNames={{
                          root:
                            role.toLowerCase() === 'owner'
                              ? classes.badgeOwner
                              : role.toLowerCase() === 'admin'
                                ? classes.badgeAdmin
                                : classes.badge,
                        }}
                      >
                        {role}
                      </Badge>
                    ) : info.label === 'Phone' ? (
                      <Input
                        component={IMaskInput}
                        mask="+91 0000000000"
                        placeholder="Enter your phone"
                        disabled={!isFieldEditable(info.label)}
                        {...(isFieldEditable(info.label) &&
                        getFieldName(info.label)
                          ? form.getInputProps(getFieldName(info.label)!)
                          : { value: info.value, readOnly: true })}
                      />
                    ) : (
                      <TextInput
                        placeholder={`Enter your ${info.label.toLowerCase()}`}
                        disabled={!isFieldEditable(info.label)}
                        {...(isFieldEditable(info.label) &&
                        getFieldName(info.label)
                          ? form.getInputProps(getFieldName(info.label)!)
                          : { value: info.value, readOnly: true })}
                      />
                    )}
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
            <Button
              mt="xl"
              type="submit"
              leftSection={<IconFileText size={20}/>}
              loading={isPending}
            >
              Update Details
            </Button>
          </form>
        </Stack>
      </Card>
      {/* Change Password Modal */}
      <ChangePassword opened={opened} close={close} />
    </>
  )
}
