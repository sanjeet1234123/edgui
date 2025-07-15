import {
  ActionIcon,
  Drawer,
  Flex,
  Indicator,
  Stack,
  Tooltip,
  Text,
  Group,
  Card,
  Divider,
  Title,
  Button,
} from '@mantine/core'
import { IconBell, IconChecks, IconClock, IconX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import classes from './notificationDrawer.module.css'
import React, { useState } from 'react'

export default function NotificationDrawer() {
  const [notifications, setNotifications] = useState([
    {
      title: 'Notification 1',
      desc: 'This is a new notification',
      time: '2 min ago',
    },
    {
      title: 'Notification 2',
      desc: 'This is a new notification',
      time: '5 min ago',
    },
    {
      title: 'Notification 3',
      desc: 'This is a new notification',
      time: '10 min ago',
    },
    {
      title: 'Notification 4',
      desc: 'This is a new notification',
      time: '20 min ago',
    },
    {
      title: 'Notification 5',
      desc: 'This is a new notification',
      time: '30 min ago',
    },
    {
      title: 'Notification 6',
      desc: 'This is a new notification',
      time: '40 min ago',
    },
    {
      title: 'Notification 7',
      desc: 'This is a new notification',
      time: '50 min ago',
    },
    {
      title: 'Notification 8',
      desc: 'This is a new notification',
      time: '60 min ago',
    },
    {
      title: 'Notification 9',
      desc: 'This is a new notification',
      time: '70 min ago',
    },
    {
      title: 'Notification 10',
      desc: 'This is a new notification',
      time: '80 min ago',
    },
  ])
  const [opened, { open, close }] = useDisclosure(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [removingIndex, setRemovingIndex] = useState<number | null>(null)
  const [markedAllRead, setMarkAllRead] = useState<boolean>(false)

  const handleRemove = (index: number) => {
    setRemovingIndex(index)

    setTimeout(() => {
      setNotifications(prev => prev.filter((_, i) => i !== index))
      setRemovingIndex(null)
    }, 200)
  }

  return (
    <>
      <Indicator
        disabled={notifications.length === 0 || markedAllRead}
        label={notifications.length}
        size="lg"
        color="var(--clr-primary)"
      >
        <Tooltip label="Notifications" position="bottom">
          <ActionIcon
            onClick={open}
            size="lg"
            variant="default"
            style={{ cursor: 'pointer' }}
          >
            <IconBell stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Indicator>

      <Drawer
        withCloseButton={false}
        opened={opened}
        onClose={close}
        title={
          <>
            {/* Header */}
            <Stack className="flex-grow w-100">
              <Group justify="space-between">
                <Title order={3}>Notifications</Title>
                <ActionIcon onClick={close} variant="transparent">
                  <IconX
                    stroke={1.5}
                    color="var(--clr-notification-drawer-x-icon)"
                  />
                </ActionIcon>
              </Group>

              {/* Mark all as read */}
              <Flex justify="flex-end" className="min-h-[40px]">
                {notifications.length > 0 && !markedAllRead && (
                  <Button
                    styles={{
                      label: {
                        fontSize: 'var(--size-sm)',
                        color: 'var(--clr-notification-drawer-mark-all-read)',
                      },
                    }}
                    onClick={() => setMarkAllRead(true)}
                    leftSection={
                      <IconChecks
                        stroke={1.5}
                        size={18}
                        color="var(--clr-notification-drawer-mark-all-read)"
                      />
                    }
                    p={0}
                    variant="transparent"
                  >
                    mark all as read
                  </Button>
                )}
              </Flex>
            </Stack>
          </>
        }
        position="right"
        padding="sm"
        styles={{
          title: { fontSize: 'var(--size-xl)', fontWeight: '600' },
          header: { paddingTop: '2rem' },
        }}
      >
        {/* Notifications List */}
        <Stack>
          {notifications.map((notification, index) => {
            const isHovered = hoveredIndex === index
            const isRemoving = removingIndex === index

            return (
              <React.Fragment key={index}>
                <Card
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`${classes.notificationCard} ${
                    isRemoving ? classes.removing : ''
                  }`}
                  bg={
                    isHovered
                      ? '#CAC9FF'
                      : markedAllRead
                        ? 'var(--clr-notification-drawer-card-marked-read)'
                        : 'var( --clr-notification-drawer-card)'
                  }
                >
                  <Group justify="space-between" align="flex-start">
                    <Flex
                      align="flex-start"
                      gap="sm"
                      className={classes.contentWrapper}
                    >
                      {/* Remove button */}
                      <div
                        className={`${classes.iconContainer} ${
                          isHovered ? classes.iconContainerVisible : ''
                        }`}
                      >
                        <ActionIcon
                          className={`${classes.actionIcon} ${
                            isHovered ? classes.actionIconVisible : ''
                          }`}
                          size={24}
                          onClick={() => handleRemove(index)}
                        >
                          <IconX stroke={1.5} />
                        </ActionIcon>
                      </div>

                      {/* Notification data */}
                      <Stack gap={2} className={classes.contentStack}>
                        <Text
                          className={classes.title}
                          c={
                            isHovered
                              ? 'black'
                              : 'var(--clr-notification-drawer-cards-title)'
                          }
                        >
                          {notification.title}
                        </Text>
                        <Text
                          className={classes.desc}
                          c={
                            isHovered
                              ? 'black'
                              : 'var(--clr-notification-drawer-cards-title)'
                          }
                        >
                          {notification.desc}
                        </Text>
                      </Stack>
                    </Flex>

                    {/* timestamp */}
                    <Group gap={5}>
                      <IconClock
                        size={14}
                        color={
                          isHovered
                            ? 'black'
                            : 'var(--clr-notification-drawer-cards-time)'
                        }
                      />
                      <Text
                        c={
                          isHovered
                            ? 'black'
                            : 'var(--clr-notification-drawer-cards-time)'
                        }
                        className={classes.time}
                      >
                        {notification.time}
                      </Text>
                    </Group>
                  </Group>
                </Card>
                <Divider />
              </React.Fragment>
            )
          })}

          {!notifications.length && (
            <Stack justify="center" align="center" className="flex-grow h-100">
              <Text>There are no new notifications</Text>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  )
}
