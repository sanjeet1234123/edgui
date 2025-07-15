import { Stack, Text, Title } from '@mantine/core'
import classes from './confirmEmail.module.css'

function ConfirmEmailHeader() {
  return (
    <Stack gap="xs">
      <Title fz="var(--size-2xl)" c="var(--clr-black)">
        Verify your Email
      </Title>
      <Text classNames={{ root: classes.subText }}>
        We have sent a six-digit verification code to{' '}
        <strong>{sessionStorage.getItem('email')}</strong>
      </Text>
    </Stack>
  )
}

export default ConfirmEmailHeader
