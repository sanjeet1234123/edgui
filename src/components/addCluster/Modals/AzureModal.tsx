import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useModalsStack,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
  IconCheck,
  IconCloudCheck,
  IconStack,
  IconX,
} from '@tabler/icons-react'
import { z } from 'zod'
import FileUpload from '../../fileUpload/FileUpload'
import classes from './modal.module.css'
import type { FileData } from '@/types/fileUploadType'
import type { OnPremClusterConfiguration } from '@/types/addClusterType'
import { useUploadClusterFileMutation } from '@/hooks/mutations/useAddClusterMutations'
import { PATHS } from '@/constants/paths'

type AzureModalProps = {
  opened: boolean
  close: () => void
}

const azureClusterConfigurationSchema = z.object({
  clusterName: z.string().min(1, 'Cluster name is required'),
  ingress: z.string().min(1, 'Ingress is required'),
  ingressClass: z.string().min(1, 'Ingress class is required'),
})

function AzureModal({ opened, close }: AzureModalProps) {
  const navigate = useNavigate()
  // Upload cluster file mutation
  const { mutate: uploadClusterFile, isPending } =
    useUploadClusterFileMutation()

  // Initialize modal stack with the IDs of all modals in the flow
  const stack = useModalsStack(['cluster-config', 'file-upload', 'success'])

  // Form configuration for cluster details
  const form = useForm<OnPremClusterConfiguration>({
    initialValues: {
      clusterName: '',
      ingress: '',
      ingressClass: '',
    },
    validate: zodResolver(azureClusterConfigurationSchema),
  })

  // State for file upload
  const [fileData, setFileData] = useState<FileData>({
    files: [],
    fileNames: [],
  })

  // Handle form submission
  const handleSubmit = () => {
    // Move to file upload modal
    stack.open('file-upload')
  }

  // Handle file upload completion
  const handleFileUploadComplete = () => {
    uploadClusterFile(
      {
        cluster_name: form.values.clusterName,
        cloud_type: 'azure',
        framework: 'terraform',
        ingress: form.values.ingress,
        ingress_class: form.values.ingressClass,
        file: fileData.files[0],
      },
      {
        onSuccess: () => {
          stack.open('success')
        },
      },
    )
  }

  // Close all modals and navigate if provided
  const handleFinish = () => {
    stack.closeAll()
    close()

    navigate({ to: PATHS.CLUSTERS })
  }

  // Function to remove a file
  const removeFile = () => {
    setFileData({ files: [], fileNames: [] })
  }

  return (
    <Modal.Stack>
      {/* First Modal: Cluster Configuration */}
      <Modal
        {...stack.register('cluster-config')}
        size="xl"
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
                Azure Account Onboarding
              </Text>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Please configure and add your Azure account
              </Text>
            </Stack>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* Cluster Configuration */}
            <Stack align="center" gap={0}>
              <Title order={3} fz="var(--size-2xl)" fw={600}>
                Cluster Configuration
              </Title>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Please provide the following details for your Azure cluster
              </Text>
            </Stack>

            {/* Cluster Configuration Form */}
            <Stack>
              <TextInput
                label="Cluster Name"
                placeholder="Enter cluster name"
                {...form.getInputProps('clusterName')}
              />
              <TextInput
                label="Ingress"
                placeholder="Enter ingress"
                {...form.getInputProps('ingress')}
              />
              <TextInput
                label="Ingress Class"
                placeholder="Enter ingress class"
                {...form.getInputProps('ingressClass')}
              />
            </Stack>

            {/* Button Group */}
            <Group justify="flex-end">
              <Button
                size="md"
                variant="outline"
                color="var(--mantine-color-gray-7)"
                onClick={close}
              >
                Cancel
              </Button>
              <Button size="md" type="submit" disabled={!form.isValid()}>
                Proceed Next
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Second Modal: File Upload */}
      <Modal
        {...stack.register('file-upload')}
        size="xl"
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
                Upload Configuration Files
              </Text>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Please upload any necessary configuration files
              </Text>
            </Stack>
          </Group>
        }
      >
        <Stack gap="xl">
          {fileData.files.length > 0 ? (
            <Stack className={classes.filePreviewContainer}>
              <Text fz="var(--size-base)" fw={500}>
                File Added
              </Text>
              {fileData.files.map((file, index) => (
                <Group key={index} className={classes.filePreview}>
                  <Stack style={{ flex: 1 }} gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" lineClamp={1}>
                        {file.name}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          color="var(--mantine-color-gray-6)"
                          onClick={removeFile}
                          variant="subtle"
                        >
                          <IconX size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Progress value={100} color="blue" size="sm" radius="xl" />
                    <Text size="xs" c="dimmed">
                      {file.size >= 1024 * 1024 * 1024
                        ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
                        : file.size >= 1024 * 1024
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(file.size / 1024).toFixed(2)} KB`}
                    </Text>
                  </Stack>
                </Group>
              ))}
            </Stack>
          ) : (
            <FileUpload
              fileData={fileData}
              setFileData={setFileData}
              allowMultiple={false}
              isDisabled={false}
              validFileTypes={['.yaml', '.yml']}
              validFileText="Allowed: YAML files up to 10MB"
            />
          )}

          <Group justify="flex-end">
            <Button
              size="md"
              variant="outline"
              color="var(--mantine-color-gray-7)"
              onClick={() => {
                stack.close('file-upload')
                stack.open('cluster-config')
              }}
            >
              Back
            </Button>
            <Button
              size="md"
              onClick={handleFileUploadComplete}
              disabled={fileData.files.length === 0}
              loading={isPending}
            >
              Complete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Third Modal: Success Confirmation */}
      <Modal
        {...stack.register('success')}
        size="xl"
        title={
          <Group>
            <ThemeIcon
              variant="outline"
              color="green"
              size="xl"
              radius="md"
              styles={{ root: { borderColor: 'var(--mantine-color-green-3)' } }}
            >
              <IconCloudCheck size={32} color="var(--mantine-color-green-6)" />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fz="var(--size-xl)" fw={600}>
                Onboarding Successful
              </Text>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Your Azure cluster has been added successfully
              </Text>
            </Stack>
          </Group>
        }
      >
        <Stack gap="xl" align="center">
          <ThemeIcon color="green" size={80} radius="xl">
            <IconCheck size={50} />
          </ThemeIcon>

          <Text ta="center" fz="var(--size-lg)" fw={500}>
            Your Azure account has been successfully onboarded. You're all set
            to start deploying, managing resources, and exploring powerful cloud
            capabilities.
          </Text>

          <Button size="md" onClick={handleFinish}>
            Go to Clusters
          </Button>
        </Stack>
      </Modal>
    </Modal.Stack>
  )
}

export default AzureModal
