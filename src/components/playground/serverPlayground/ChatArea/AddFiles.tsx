import { useState } from 'react'
import { ActionIcon, Popover, Stack, FileInput } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { HardDrive, ImagePlus, Paperclip } from 'lucide-react'

function AddFiles({ disabled = false }: { disabled?: boolean }) {
  const [addFilesOpened, setAddFilesOpened] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<Number | null>(null)
  const [fileData, setFileData] = useState<{
    name: string
    type: string
    size: number
  } | null>(null)

  return (
    <Popover
      opened={addFilesOpened}
      onChange={setAddFilesOpened}
      position="top-start"
      offset={8}
      styles={{
        dropdown: {
          padding: '0.5rem',
          boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Popover.Target>
        <ActionIcon
          disabled={disabled}
          size="lg"
          variant="outline"
          onClick={() => setAddFilesOpened(o => !o)}
        >
          <IconPlus
            size={20}
            stroke={1.5}
            className={`transform transition-transform duration-200 ease-in-out ${addFilesOpened ? 'rotate-45' : ''}`}
          />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={0}>
          {[
            {
              icon: ImagePlus,
              label: 'Add Image',
              accept: 'image/png,image/jpeg,image/webp',
            },
            { icon: Paperclip, label: 'Add File', accept: '.pdf,.docx,.txt' },
            { icon: HardDrive, label: 'Add from Drive' },
          ].map((item, index) => {
            return (
              <FileInput
                key={index}
                accept={item.accept ?? undefined}
                clearable
                variant="unstyled"
                leftSection={<item.icon size={20} strokeWidth={1.5} />}
                placeholder={item.label}
                leftSectionPointerEvents="none"
                styles={{
                  placeholder: {
                    color:
                      hoveredIndex === index
                        ? 'var(--clr-add-file-label-hovered)'
                        : 'var(--clr-add-file-label)',
                  },
                  section: {
                    color:
                      hoveredIndex === index
                        ? 'var(--clr-add-file-label-hovered)'
                        : 'var(--clr-add-file-label)',
                  },
                }}
                onMouseOver={() => {
                  setHoveredIndex(index)
                }}
                onMouseOut={() => {
                  setHoveredIndex(null)
                }}
                onChange={file => {
                  if (file) {
                    // Handle file upload logic here
                    console.log('File selected:', file)
                    setFileData(file)
                  }
                }}
              />
            )
          })}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export default AddFiles
