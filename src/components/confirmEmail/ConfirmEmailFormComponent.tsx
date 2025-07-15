import { PinInput, Button, Stack, Text, Group } from '@mantine/core'
import type { ConfirmEmailForm } from '@/types/confirmEmailType'
import type { UseFormReturnType } from '@mantine/form'
import classes from './confirmEmail.module.css'
import { useRequestVerificationCodeMutation } from '@/hooks/mutations/useAuthMutations'
import { useMediaQuery } from '@mantine/hooks'

type ConfirmEmailFormComponentProps = {
  form: UseFormReturnType<ConfirmEmailForm>
  isLoading: boolean
}

function ConfirmEmailFormComponent({
  form,
  isLoading,
}: ConfirmEmailFormComponentProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const { mutate: requestVerificationCode } =
    useRequestVerificationCodeMutation()

  // Handle the request code button click
  const handleRequestCode = () => {
    requestVerificationCode({
      email: sessionStorage.getItem('email')!,
    })
  }

  // Render the component
  return (
    <>
      <Stack>
        <Text className={classes.verificationCodeText}>
          Enter the verification code
        </Text>
        <PinInput
          length={6}
          radius="md"
          type="number"
          size={isMobile ? 'md' : 'lg'}
          classNames={classes}
          placeholder=""
          {...form.getInputProps('verificationCode')}
        />
        {form.errors.verificationCode && (
          <Text classNames={{ root: classes.error }}>
            {form.errors.verificationCode}
          </Text>
        )}

        <Group gap={4} justify="center" align="center">
          <Text classNames={{ root: classes.sendCodeText }}>
            Didn't receive the verification code ?
          </Text>
          <Button
            variant="transparent"
            size="sm"
            classNames={{ root: classes.sendCodeButton }}
            onClick={handleRequestCode}
          >
            Send code again
          </Button>
        </Group>
      </Stack>

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
      >
        Verify Email
      </Button>
    </>
  )
}

export default ConfirmEmailFormComponent
