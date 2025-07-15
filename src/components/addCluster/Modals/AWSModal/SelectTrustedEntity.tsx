import { Anchor, Button, List, Loader, Stack, Text } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import { useAwsRoleQuery } from '@/hooks/queries/useAddClusterQueries'

function SelectTrustedEntity() {
  const {
    data: awsRole,
    isPending,
    isError,
    isSuccess,
    error,
    refetch,
  } = useAwsRoleQuery()

  return (
    <List
      withPadding
      type="ordered"
      className="list-decimal"
      styles={{ item: { fontSize: 'var(--size-lg)', padding: '4px 0' } }}
    >
      <List.Item>
        <Anchor
          href="https://us-east-1.console.aws.amazon.com/iam/home?region=us-west-2#/roles/create"
          target="_blank"
        >
          Open the AWS IAM Console to Create Role
        </Anchor>
      </List.Item>
      <List.Item>
        Please verify the following options:
        <List className="list-disc" styles={{ item: { padding: '4px 0' } }}>
          <List.Item>Trusted entity type is Custom Trust Policy</List.Item>
          <List.Item>
            <Stack>
              <Text fz="var(--size-base)">
                Please use this Trust Relationship Policy
              </Text>
              {isPending && <Loader size="sm" />}
              {isError && (
                <Stack>
                  <Text>Unable to fetch role, please try again</Text>
                  <Text c="var(--mantine-color-error)">{error.message}</Text>
                  <Button onClick={() => refetch()}>Retry</Button>
                </Stack>
              )}
              {isSuccess && (
                <CodeHighlight
                  code={JSON.stringify(awsRole.data, null, 4)}
                  language="json"
                  copyLabel="Copy Role Policy"
                  copiedLabel="Copied!"
                />
              )}
            </Stack>
          </List.Item>
        </List>
      </List.Item>
      <List.Item>
        Please ensure the Permissions for accessing the Instances
      </List.Item>
    </List>
  )
}

export default SelectTrustedEntity
