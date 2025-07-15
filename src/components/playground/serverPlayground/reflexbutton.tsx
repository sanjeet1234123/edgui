import { Button, Tooltip } from '@mantine/core'
import { IconArrowsHorizontal } from '@tabler/icons-react'

function ReflexButton({
  onClick,
  isCollapsed,
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
}: {
  onClick?: () => void
  isCollapsed: boolean
  expandLabel?: string
  collapseLabel?: string
}) {
  return (
    <Tooltip
      label={isCollapsed ? expandLabel : collapseLabel}
      position="top"
      withArrow
    >
      <Button
        color="var(--clr-primary)"
        size="xs"
        w={50}
        p={0}
        onClick={onClick}
        styles={{
          root: {
            position: 'absolute',
            transform: 'translateX(-50%)',
            zIndex: 99,
          },
        }}
      >
        <IconArrowsHorizontal />
      </Button>
    </Tooltip>
  )
}

export default ReflexButton
