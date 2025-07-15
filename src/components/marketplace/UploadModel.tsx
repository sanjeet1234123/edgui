import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Progress,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDownload, IconX } from '@tabler/icons-react'
import classes from './marketplace.module.css'
import type { LoadModelForm } from '@/types/marketplaceType'
import type { FileData } from '@/types/fileUploadType'
import FileUpload from '@/components/fileUpload/FileUpload'
import { useLoadModelMutation } from '@/hooks/mutations/useMarketplaceMutations'

type UploadModelProps = {
  opened: boolean
  onClose: () => void
}

function UploadModel({ opened, onClose }: UploadModelProps) {
  const { mutate: loadModelMutation, isPending } = useLoadModelMutation()

  const [fileData, setFileData] = useState<FileData>({
    files: [],
    fileNames: [],
  })

  const form = useForm<LoadModelForm>({
    initialValues: {
      addUrlInput: '',
      addDescriptionInput: '',
      addTokenInput: '',
    },
    validate: {
      addUrlInput: (value) => {
        // Only validate URL if there are no files uploaded
        if (fileData.files.length === 0 && value.length === 0) {
          return 'URL is required when no files are uploaded'
        }
        return null
      },
      addDescriptionInput: (value) => {
        // Only validate description if there are no files uploaded
        if (fileData.files.length === 0 && value.length === 0) {
          return 'Description is required when no files are uploaded'
        }
        return null
      },
    },
  })

  // Function to remove a file
  const removeFile = (indexToRemove: number) => {
    setFileData((prev) => ({
      files: prev.files.filter((_, index) => index !== indexToRemove),
      fileNames: prev.fileNames.filter((_, index) => index !== indexToRemove),
    }))
  }

  // Function to download a file
  const downloadFile = (index: number) => {
    const file = fileData.files[index]

    // Create a URL for the file
    const url = URL.createObjectURL(file)

    // Create a temporary anchor element
    const a = document.createElement('a')
    a.href = url
    a.download = file.name // Set the file name for download

    // Append to body, click, and remove
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the URL object
    URL.revokeObjectURL(url)
  }

  const handleSubmit = (values: LoadModelForm) => {
    // Only include URL and token in submission if no files are uploaded
    // const submissionData =
    //   fileData.files.length > 0
    //     ? { files: fileData.files }
    //     : {
    //         url: values.addUrlInput,
    //         token: values.addTokenInput,
    //         description: values.addDescriptionInput,
    //       }

    if (fileData.files.length === 0) {
      loadModelMutation(
        {
          url: values.addUrlInput,
          description: values.addDescriptionInput,
          trending: true,
        },
        {
          onSuccess: () => {
            onClose()
          },
        },
      )
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Stack gap={0}>
          <Text fz="var(--size-xl)" fw={600}>
            Please Upload your Model
          </Text>
          <Text fz="var(--size-sm)" c="var(--mantine-color-gray-6)">
            Select model files for upload
          </Text>
        </Stack>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Hugging Face URL"
            placeholder="https://www.huggingface.com/deepseek"
            disabled={fileData.files.length > 0}
            {...form.getInputProps('addUrlInput')}
          />
          <TextInput
            label="Description"
            placeholder="Enter your model description"
            disabled={fileData.files.length > 0}
            {...form.getInputProps('addDescriptionInput')}
          />
          <PasswordInput
            label="Hugging Face Token (Optional)"
            placeholder="Enter your token"
            disabled={fileData.files.length > 0}
            {...form.getInputProps('addTokenInput')}
          />
          <Divider my="xs" label="OR" labelPosition="center" />

          {fileData.files.length > 0 ? (
            <Stack className={classes.filePreviewContainer}>
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
                          onClick={() => downloadFile(index)}
                          variant="subtle"
                        >
                          <IconDownload size={18} />
                        </ActionIcon>

                        <ActionIcon
                          color="var(--mantine-color-gray-6)"
                          onClick={() => removeFile(index)}
                          variant="subtle"
                        >
                          <IconX size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Progress
                      value={100}
                      color="blue"
                      size="sm"
                      radius="xl"
                      striped
                      animated
                    />
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
              allowMultiple={true}
              isDisabled={true}
              validFileTypes={[
                '.safetensors', // SafeTensor format
                '.bin', // Binary model files (e.g., Hugging Face, PyTorch)
                '.ckpt', // Checkpoint files (e.g., Stable Diffusion, TensorFlow, PyTorch)
                'webp',
              ]}
              validFileText="Allowed: .safetensor, .bin, .ckpt, .webp — max 30 GB per file"
            />
          )}

          <Group justify="flex-end" mt="md">
            <Button size="md" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="md"
              type="submit"
              loading={isPending}
              disabled={isPending}
            >
              Upload
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default UploadModel
