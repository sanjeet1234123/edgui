// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SelectTrustedEntity from '@/components/addCluster/Modals/AWSModal/SelectTrustedEntity'
import { useAwsRoleQuery } from '@/hooks/queries/useAddClusterQueries'

// Mock the useAwsRoleQuery hook
jest.mock('@/hooks/queries/useAddClusterQueries', () => ({
  useAwsRoleQuery: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const List = ({ children, type, className, styles }) => (
    <ul data-testid="ordered-list" data-type={type} className={className}>
      {children}
    </ul>
  )
  List.Item = ({ children }) => <li data-testid="list-item">{children}</li>

  return {
    Anchor: ({ children, href, target }) => (
      <a href={href} target={target} data-testid="aws-console-link">
        {children}
      </a>
    ),
    Button: ({ children, onClick }) => (
      <button onClick={onClick} data-testid="retry-button">
        {children}
      </button>
    ),
    List,
    Loader: () => <div data-testid="loader">Loading...</div>,
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Text: ({ children, c, fz }) => (
      <span data-color={c} data-size={fz}>
        {children}
      </span>
    ),
  }
})

// Mock CodeHighlight component
jest.mock('@mantine/code-highlight', () => ({
  CodeHighlight: ({ code, language, copyLabel, copiedLabel }) => (
    <div data-testid="code-highlight" data-language={language}>
      <pre>{code}</pre>
      <button data-testid="copy-button">{copyLabel}</button>
    </div>
  ),
}))

describe('SelectTrustedEntity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    useAwsRoleQuery.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
    })

    render(<SelectTrustedEntity />)

    expect(screen.getByTestId('loader')).toBeInTheDocument()
    expect(
      screen.getByText('Open the AWS IAM Console to Create Role'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Trusted entity type is Custom Trust Policy'),
    ).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    const mockError = new Error('Failed to fetch role')
    useAwsRoleQuery.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      error: mockError,
      refetch: jest.fn(),
    })

    render(<SelectTrustedEntity />)

    expect(
      screen.getByText('Unable to fetch role, please try again'),
    ).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch role')).toBeInTheDocument()
    expect(screen.getByTestId('retry-button')).toBeInTheDocument()
  })

  it('renders success state with role data correctly', () => {
    const mockRoleData = {
      data: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'ec2.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      },
    }

    useAwsRoleQuery.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: mockRoleData,
    })

    render(<SelectTrustedEntity />)

    expect(screen.getByTestId('code-highlight')).toBeInTheDocument()
    // Use a function matcher to find the pretty-printed JSON
    const prettyJson = JSON.stringify(mockRoleData.data, null, 4)
    expect(
      screen.getByText((content, node) => {
        return (
          node.tagName.toLowerCase() === 'pre' &&
          content.includes('"Version": "2012-10-17"')
        )
      }),
    ).toBeInTheDocument()
  })

  it('handles retry functionality', () => {
    const mockRefetch = jest.fn()
    useAwsRoleQuery.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error('Failed to fetch role'),
      refetch: mockRefetch,
    })

    render(<SelectTrustedEntity />)

    const retryButton = screen.getByTestId('retry-button')
    fireEvent.click(retryButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('renders AWS console link with correct attributes', () => {
    useAwsRoleQuery.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: {} },
    })

    render(<SelectTrustedEntity />)

    const awsLink = screen.getByTestId('aws-console-link')
    expect(awsLink).toHaveAttribute(
      'href',
      'https://us-east-1.console.aws.amazon.com/iam/home?region=us-west-2#/roles/create',
    )
    expect(awsLink).toHaveAttribute('target', '_blank')
  })
})
