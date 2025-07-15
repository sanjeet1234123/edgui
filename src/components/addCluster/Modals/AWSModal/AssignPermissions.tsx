import { forwardRef, useImperativeHandle } from 'react'
import { Select, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { IconChevronDown } from '@tabler/icons-react'
import classes from '../modal.module.css'
import type { AssignPermissionsFormValues } from '@/types/addClusterType'
import {
  useAssignPermissionsMutation,
  useGetAWSInstancesMutation,
} from '@/hooks/mutations/useAddClusterMutations'
import useAddClusterStore from '@/store/addClusterStore'

const REGIONS = [
  { id: 1, region: 'us-east-2' },
  { id: 2, region: 'us-east-1' },
  { id: 3, region: 'us-west-1' },
  { id: 4, region: 'us-west-2' },
  { id: 5, region: 'af-south-1' },
  { id: 6, region: 'ap-east-1' },
  { id: 7, region: 'ap-south-2' },
  { id: 8, region: 'ap-southeast-3' },
  { id: 9, region: 'ap-southeast-5' },
  { id: 10, region: 'ap-southeast-4' },
  { id: 11, region: 'ap-south-1' },
  { id: 12, region: 'ap-northeast-3' },
  { id: 13, region: 'ap-northeast-2' },
  { id: 14, region: 'ap-southeast-1' },
  { id: 15, region: 'ap-southeast-2' },
  { id: 16, region: 'ap-southeast-7' },
  { id: 17, region: 'ap-northeast-1' },
  { id: 18, region: 'ca-central-1' },
  { id: 19, region: 'ca-west-1' },
  { id: 20, region: 'eu-central-1' },
  { id: 21, region: 'eu-west-1' },
  { id: 22, region: 'eu-west-2' },
  { id: 23, region: 'eu-south-1' },
  { id: 24, region: 'eu-west-3' },
  { id: 25, region: 'eu-south-2' },
  { id: 26, region: 'eu-north-1' },
  { id: 27, region: 'eu-central-2' },
  { id: 28, region: 'il-central-1' },
  { id: 29, region: 'mx-central-1' },
  { id: 30, region: 'me-south-1' },
  { id: 31, region: 'me-central-1' },
  { id: 32, region: 'sa-east-1' },
  { id: 33, region: 'us-gov-east-1' },
  { id: 34, region: 'us-gov-west-1' },
]

const assignPermissionsSchema = z.object({
  awsARN: z.string().min(1, 'AWS ARN is required'),
  region: z.string().min(1, 'Region is required'),
})

export interface AssignPermissionsRef {
  submitForm: () => Promise<boolean>
  validateForm: () => boolean
}

const AssignPermissions = forwardRef<AssignPermissionsRef>((_, ref) => {
  const USER_ID = localStorage.getItem('user_id')
  const { mutate: assignPermissions } = useAssignPermissionsMutation()
  const { mutate: getAWSInstances } = useGetAWSInstancesMutation()

  const { setVMS, setAccountId } = useAddClusterStore()
  const form = useForm<AssignPermissionsFormValues>({
    initialValues: {
      awsARN: '',
      region: REGIONS[0].region,
    },
    validate: zodResolver(assignPermissionsSchema),
  })

  const handleSubmit = (values: AssignPermissionsFormValues) => {
    assignPermissions(
      {
        user_id: Number(USER_ID),
        user_resource_arn: values.awsARN,
        region: values.region,
      },
      {
        onSuccess: () => {
          getAWSInstances(Number(USER_ID), {
            onSuccess: data => {
              const clusters = data.clusters.map(
                (item: string, index: number) => {
                  return {
                    id: index + 1,
                    vm: item,
                  }
                },
              )

              setVMS(clusters)
              setAccountId(data.account_id)
            },
          })
        },
      },
    )
  }

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const validation = form.validate()
      return !validation.hasErrors
    },
    submitForm: () => {
      return new Promise<boolean>(resolve => {
        const validation = form.validate()

        if (validation.hasErrors) {
          resolve(false)
          return
        }

        assignPermissions(
          {
            user_id: Number(USER_ID),
            user_resource_arn: form.values.awsARN,
            region: form.values.region,
          },
          {
            onSuccess: () => {
              getAWSInstances(Number(USER_ID))
              resolve(true)
            },
            onError: () => {
              resolve(false)
            },
          },
        )
      })
    },
  }))

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text ta="center" fz="var(--size-lg)" fw={500}>
          Please enter the IAM Role arn you have created
        </Text>
        <TextInput
          label="AWS ARN"
          placeholder="arn:aws:iam::123456789012:role/MyRole"
          {...form.getInputProps('awsARN')}
        />
        <Select
          label="Region"
          placeholder="Select a region"
          data={REGIONS.map(region => ({
            value: region.region,
            label: region.region,
          }))}
          defaultValue={REGIONS[0].region}
          allowDeselect={false}
          rightSection={<IconChevronDown size={16} />}
          {...form.getInputProps('region')}
        />
      </Stack>
    </form>
  )
})

export default AssignPermissions
