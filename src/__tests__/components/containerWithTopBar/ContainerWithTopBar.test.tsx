// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ContainerWithTopBar from '@/components/containerWithTopBar/ContainerWithTopBar'
import { MantineProvider } from '@mantine/core'

// Define types for mocks
interface MantineCoreMock {
  useMantineColorScheme: jest.Mock;
  AppShell: any;
  Group: React.FC<any>;
  Image: React.FC<any>;
  MantineProvider: React.FC<any>;
}

// Define type for the color scheme value returned by the hook
interface ColorSchemeContext {
  colorScheme: 'light' | 'dark';
  setColorScheme: (value: 'light' | 'dark') => void;
  toggleColorScheme: () => void;
}

// Mock Mantine core components
jest.mock('@mantine/core', () => {
  // Store the colorScheme value so we can change it for different tests
  let currentColorScheme: 'light' | 'dark' = 'light';
  
  // Create mock functions
  const mockToggleColorScheme = jest.fn(() => {
    currentColorScheme = currentColorScheme === 'light' ? 'dark' : 'light';
  });
  
  const mockSetColorScheme = jest.fn((value: 'light' | 'dark') => {
    currentColorScheme = value;
  });
  
  // Create a mock for useMantineColorScheme
  const mockUseMantineColorScheme = jest.fn(() => ({
    colorScheme: currentColorScheme,
    toggleColorScheme: mockToggleColorScheme,
    setColorScheme: mockSetColorScheme
  }));
  
  // Wrapped components to pass children through
  const AppShell = ({ children, header, classNames }: any) => (
    <div data-testid="app-shell">
      {header && <div data-testid="app-shell-header">{header.height && <div>Height: {header.height}</div>}</div>}
      <div data-testid="app-shell-main" className={classNames?.main}>{children}</div>
    </div>
  );
  
  // Add child components to AppShell
  AppShell.Header = ({ children, bg }: any) => (
    <header data-testid="app-shell-header-component" style={{ background: bg }}>{children}</header>
  );
  
  AppShell.Main = ({ children }: any) => (
    <main data-testid="app-shell-main-component">{children}</main>
  );
  
  return {
    useMantineColorScheme: mockUseMantineColorScheme,
    AppShell,
    Group: ({ children, h, px }: any) => (
      <div data-testid="mantine-group" style={{ height: h, padding: `0 ${px}` }}>{children}</div>
    ),
    Image: ({ src, alt, w }: any) => (
      <img data-testid="mantine-image" src={src} alt={alt} style={{ width: w }} />
    ),
    MantineProvider: ({ children }: any) => <div>{children}</div>
  };
});

// Mock CSS module
jest.mock('@/components/containerWithTopBar/containerWithTopBar.module.css', () => ({
  authContainer: 'mock-auth-container',
  authContainerMain: 'mock-auth-container-main',
}));

// Mock assets
jest.mock('@/assets/logos/nexastack-logo.png', () => 'mocked-light-logo', { virtual: true });
jest.mock('@/assets/logos/nexastack-dark-logo.png', () => 'mocked-dark-logo', { virtual: true });

// Helper component for wrapping ContainerWithTopBar with MantineProvider
const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('ContainerWithTopBar', () => {
  it('renders correctly in light mode', () => {
    // Get and configure the mock
    const coreMock = jest.requireMock('@mantine/core') as MantineCoreMock;
    const mockUseMantineColorScheme = coreMock.useMantineColorScheme;
    mockUseMantineColorScheme.mockReturnValue({ 
      colorScheme: 'light',
      toggleColorScheme: jest.fn(),
      setColorScheme: jest.fn()
    });
    
    renderWithProvider(
      <ContainerWithTopBar>
        <div data-testid="test-child">Test Content</div>
      </ContainerWithTopBar>
    );
    
    // Check if the component renders the AppShell
    expect(screen.getByTestId('app-shell')).toBeTruthy();
    
    // Check if the component renders the header
    expect(screen.getByTestId('app-shell-header-component')).toBeTruthy();
    
    // Check if the component renders the image with correct logo
    const image = screen.getByTestId('mantine-image');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('mocked-light-logo');
    
    // Check if the component renders the children
    expect(screen.getByTestId('test-child')).toBeTruthy();
    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('renders correctly in dark mode', () => {
    // Get and configure the mock
    const coreMock = jest.requireMock('@mantine/core') as MantineCoreMock;
    const mockUseMantineColorScheme = coreMock.useMantineColorScheme;
    mockUseMantineColorScheme.mockReturnValue({ 
      colorScheme: 'dark',
      toggleColorScheme: jest.fn(),
      setColorScheme: jest.fn()
    });
    
    renderWithProvider(
      <ContainerWithTopBar>
        <div data-testid="test-child">Test Content</div>
      </ContainerWithTopBar>
    );
    
    // Check if the component renders the AppShell
    expect(screen.getByTestId('app-shell')).toBeTruthy();
    
    // Check if the component renders the header
    expect(screen.getByTestId('app-shell-header-component')).toBeTruthy();
    
    // Check if the component renders the image with correct logo - should be dark mode logo
    const image = screen.getByTestId('mantine-image');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('mocked-dark-logo');
    
    // Check if the component renders the children
    expect(screen.getByTestId('test-child')).toBeTruthy();
    expect(screen.getByText('Test Content')).toBeTruthy();
  });
}); 