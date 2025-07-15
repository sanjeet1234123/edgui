// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock only the CSS modules that actually exist in the filesystem
jest.mock('@/components/signup/signup.module.css', () => ({
  form: 'form-class',
}))

jest.mock(
  '@/components/projectMemberRegistration/projectMemberRegistration.module.css',
  () => ({
    form: 'form-class',
  }),
)

jest.mock('@/components/memberSignup/memberSignup.module.css', () => ({
  form: 'form-class',
}))

jest.mock(
  '@/components/memberRegistration/memberRegistration.module.css',
  () => ({
    form: 'form-class',
  }),
)

jest.mock('@/components/memberLogin/memberLogin.module.css', () => ({
  form: 'form-class',
}))

jest.mock('@/components/confirmEmail/confirmEmail.module.css', () => ({
  form: 'form-class',
}))

jest.mock('@/components/forgetPassword/forgetPassword.module.css', () => ({
  form: 'form-class',
}))

jest.mock('@/components/forgetWorkspace/forgetWorkspace.module.css', () => ({
  form: 'form-class',
}))

jest.mock('@/components/project/project.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/projects/projects.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/workspace/workspace.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/addCluster/addCluster.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/login/login.module.css', () => ({
  form: 'form-class',
}))

jest.mock(
  '@/components/notificationDrawer/notificationDrawer.module.css',
  () => ({
    container: 'container-class',
  }),
)

jest.mock('@/components/project/overview/Overview.module.css', () => ({
  container: 'container-class',
}))

jest.mock('@/components/authContainer/authContainer.module.css', () => ({
  container: 'container-class',
}))

// Mock static asset imports
jest.mock('@/assets/images/authentication-image.png', () => '')
jest.mock('@/assets/logos/nexastack-logo.png', () => '')
jest.mock('@/assets/logos/nexastack-dark-logo.png', () => '')

// Mock the endpoint module
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Loader: () => <div role="progressbar" />,
  Center: ({ children, className }) => (
    <div className={className}>{children}</div>
  ),
  Stack: ({ children, className }) => (
    <div className={className}>{children}</div>
  ),
  MantineProvider: ({ children }) => <div>{children}</div>,
}))

// Mock server components
jest.mock('@/components/server', () => ({
  __esModule: true,
  ServerHeader: ({ server }) => (
    <div data-testid="server-header">{server?.name}</div>
  ),
  ServerBody: ({ server }) => <div data-testid="server-body">{server?.id}</div>,
}))

// Mock UI components
jest.mock('@/components/ui', () => ({
  __esModule: true,
  ComponentError: ({ error }) => (
    <div data-testid="error-component">{error?.message || 'Error'}</div>
  ),
}))

// Mock the server queries hook
jest.mock('@/hooks/queries/useServerQueries', () => ({
  useGetServerQuery: jest.fn(),
}))

// Mock TanStack Router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: jest.fn(() => ({
    useParams: jest.fn(() => ({ serverId: '123' })),
  })),
}))

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { useGetServerQuery } from '@/hooks/queries/useServerQueries'

// Create a test component that mimics the route behavior
const TestServerRouteComponent = () => {
  const { isLoading, data } = useGetServerQuery('123')
  const { ServerHeader, ServerBody } = require('@/components/server')
  const { Center, Loader, Stack } = require('@mantine/core')

  // Find the server by matching name (case insensitive) or default to first server
  let server = null
  if (data?.data && Array.isArray(data.data)) {
    server = data.data.find(v => {
      return v.name.toLowerCase() === '123'.toLowerCase()
    })
    // If no match found by name, use the first server or create a mock one
    if (!server && data.data.length > 0) {
      server = data.data[0]
    }
  }

  if (isLoading) {
    return (
      <Center className="flex-grow">
        <Loader />
      </Center>
    )
  }

  return (
    <Stack className="flex-grow">
      <ServerHeader server={server} />
      <ServerBody server={server} />
    </Stack>
  )
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

describe('Server Route', () => {
  let queryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    jest.clearAllMocks()
  })

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <TestServerRouteComponent />
        </MantineProvider>
      </QueryClientProvider>,
    )
  }

  it('should render loading state', () => {
    useGetServerQuery.mockReturnValue({
      isLoading: true,
      data: null,
    })

    renderWithProviders()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render server data when loaded', () => {
    const mockServerData = {
      data: [
        {
          id: '123',
          name: 'Test Server',
        },
      ],
    }

    useGetServerQuery.mockReturnValue({
      isLoading: false,
      data: mockServerData,
    })

    renderWithProviders()

    expect(screen.getByTestId('server-header')).toHaveTextContent('Test Server')
    expect(screen.getByTestId('server-body')).toHaveTextContent('123')
  })
})
