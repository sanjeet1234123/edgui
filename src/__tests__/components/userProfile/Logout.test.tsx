// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock the constants/endpoint to bypass import.meta.env issue
jest.mock('@/constants/endpoint', () => 'https://mocked-api-url.com/api', { virtual: true });

// Create a mock logout mutation function
const mockLogoutMutate = jest.fn();

// Mock the auth hooks that might import axios instance using the endpoint
jest.mock('@/hooks/mutations/useAuthMutations', () => ({
  useLogoutMutation: () => ({
    mutate: mockLogoutMutate
  })
}));

// Now import the component which will use our mocks
import Logout from '@/components/userProfile/Logout'

// Store original functions
const originalLocalStorage = global.localStorage;
const originalWindowLocation = window.location;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, rightSection, color, variant, size, fz }: { 
    children: React.ReactNode; 
    onClick: () => void;
    rightSection?: React.ReactNode;
    color?: string;
    variant?: string;
    size?: string;
    fz?: string;
  }) => (
    <button 
      data-testid="logout-button"
      onClick={onClick}
      style={{ color }}
    >
      {rightSection && <span data-testid="button-icon">{rightSection}</span>}
      {children}
    </button>
  ),
  Group: ({ children, align }: { children: React.ReactNode, align?: string }) => (
    <div data-testid="mantine-group">{children}</div>
  )
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconLogout: ({ size }: { size: number }) => (
    <div data-testid="icon-logout" style={{ width: size, height: size }}>
      Logout Icon
    </div>
  )
}))

describe('Logout', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  // Restore originals after all tests
  afterAll(() => {
    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalWindowLocation,
      writable: true,
      configurable: true
    });
  });

  it('renders the logout button correctly', () => {
    render(<Logout />);
    
    // Check if the button is rendered
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeTruthy();
    
    // Check if the icon is rendered
    const logoutIcon = screen.getByTestId('icon-logout');
    expect(logoutIcon).toBeTruthy();
    
    // Check if the button text is correct
    expect(logoutButton.textContent).toContain('Logout');
  });

  it('calls the logout mutation when clicked', () => {
    render(<Logout />);
    
    // Find and click the logout button
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    
    // Check if the logout mutation was called
    expect(mockLogoutMutate).toHaveBeenCalled();
  });
}); 