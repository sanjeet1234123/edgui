import { useRef, useState } from 'react'
import { Stack, Text } from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'
import classes from './FileUpload.module.css'
import type { Dispatch, SetStateAction } from 'react'
import type { FileData } from '@/types/fileUploadType'

type FileUploadProps = {
  fileData: FileData
  setFileData: Dispatch<SetStateAction<FileData>>
  allowMultiple: boolean
  isDisabled: boolean
  validFileTypes: Array<string>
  validFileText?: string
}

function FileUpload({
  fileData,
  setFileData,
  allowMultiple = false,
  isDisabled = false,
  validFileTypes,
  validFileText,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const processFiles = (selectedFiles: Array<File>) => {
    if (selectedFiles.length) {
      if (fileData.files.length + selectedFiles.length > 2) {
        setError('You can upload a maximum of 2 files.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      } else {
        setError('')
      }

      const maxFileSize = 30 * 1024 * 1024 * 1024

      const invalidFiles = selectedFiles.filter((file: File) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
        return !validFileTypes.some(
          type => fileExtension === type.replace('.', ''),
        )
      })

      const largeFiles = selectedFiles.filter(
        (file: File) => file.size > maxFileSize,
      )

      if (invalidFiles.length) {
        const invalidExtensions = invalidFiles.map(
          (file: File) => file.name.split('.').pop()?.toLowerCase() || '',
        )
        const uniqueInvalidExtensions = [...new Set(invalidExtensions)]

        if (uniqueInvalidExtensions.length === 1) {
          setError(
            `${uniqueInvalidExtensions[0]} file is an unsupported format.`,
          )
        } else {
          setError(
            `${uniqueInvalidExtensions.join(
              ', ',
            )} files are unsupported formats.`,
          )
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      if (largeFiles.length) {
        setError('Some files exceed the maximum size limit of 30 GB.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      const newFileNames = selectedFiles.map((file: File) => file.name)
      setFileData(prev => ({
        files: [...prev.files, ...selectedFiles],
        fileNames: [...prev.fileNames, ...newFileNames],
      }))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const selectedFiles = Array.from(files)
      processFiles(selectedFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDisabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!isDisabled) {
      const selectedFiles = Array.from(e.dataTransfer.files)
      processFiles(selectedFiles)
    }
  }

  const openFileDialog = () => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <Stack
      justify="center"
      align="center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${classes.fileUploadContainer} ${
        isDragging ? classes.dragActive : ''
      } ${isDisabled ? classes.fileUploadContainerDisabled : ''}`}
    >
      <IconUpload
        size={40}
        color={
          isDisabled
            ? 'var(--mantine-color-gray-6)'
            : 'var(--mantine-color-black)'
        }
      />
      <Stack gap={0} align="center">
        <Text fw={500} c={isDisabled ? 'var(--mantine-color-gray-6)' : ''}>
          Drag and drop or{' '}
          <strong
            className={isDisabled ? classes.strongDisabled : ''}
            onClick={openFileDialog}
          >
            choose file
          </strong>
        </Text>
        <input
          type="file"
          ref={fileInputRef}
          multiple={allowMultiple}
          onChange={handleFileChange}
          disabled={isDisabled}
          style={{ display: 'none' }}
          accept={validFileTypes.join(',')}
        />
        <Text c="var(--mantine-color-gray-6)" size="sm">
          {validFileText || `Allowed: ${validFileTypes.join(', ')}`}
        </Text>
        {error && (
          <Text c="red" size="sm" mt="xs">
            {error}
          </Text>
        )}
      </Stack>
    </Stack>
  )
}

export default FileUpload
