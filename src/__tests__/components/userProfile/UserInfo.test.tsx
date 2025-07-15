// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Store original localStorage
const originalLocalStorage = global.localStorage;

// Create a mock localStorage implementation
const createMockLocalStorage = () => {
  const mockLocalStorage = {
    getItem: jest.fn((key) => {
      const mockData = {
        'name': 'Test User',
        'email': 'test@example.com',
        'workspace_id': 'workspace-123'
      };
      return mockData[key] || null;
    }),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    length: 0,
    key: jest.fn()
  };
  return mockLocalStorage;
};

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Avatar: ({ name, color, size, radius }: { name: string; color: string; size: string; radius: string }) => (
    <div data-testid="avatar" style={{ color, borderRadius: radius }}>
      {name ? name.charAt(0) : ''}
    </div>
  ),
  Stack: ({ children, gap }: { children: React.ReactNode; gap: number }) => (
    <div data-testid="stack">{children}</div>
  ),
  Text: ({ children, fz, fw, c }: { children: React.ReactNode; fz: string; fw: number; c: string }) => (
    <div data-testid="text" style={{ fontSize: fz, fontWeight: fw, color: c }}>
      {children}
    </div>
  ),
  Group: ({ children, align }: { children: React.ReactNode; align: string }) => (
    <div data-testid="group" style={{ alignItems: align }}>
      {children}
    </div>
  ),
}))

describe('UserInfo', () => {
  // Set up a mock localStorage before each test
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  
  beforeEach(() => {
    // Create a fresh mock and install it
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Clear mocks between tests
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore the original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  // Now import the component for each test to ensure it uses our mocked localStorage
  it('renders user information from localStorage', () => {
    // We need to import dynamically after setting up the mock
    jest.isolateModules(() => {
      const UserInfo = require('@/components/userProfile/UserInfo').default;
      
      render(<UserInfo />);
      
      // Verify localStorage was called for each key
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('name');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('email');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('workspace_id');
      
      // Get all text elements and check the component renders correctly
      const textElements = screen.getAllByTestId('text');
      expect(textElements.length).toBe(3);
      
      // Verify rendered content based on mocked localStorage values
      expect(textElements[0].textContent).toContain('Test User');
      expect(textElements[1].textContent).toContain('test@example.com');
      expect(textElements[2].textContent).toContain('Workspace - workspace-123');
    });
  });

  it('handles missing localStorage values gracefully', () => {
    // Change the mock to return null for all keys
    mockLocalStorage.getItem.mockReturnValue(null);
    
    jest.isolateModules(() => {
      const UserInfo = require('@/components/userProfile/UserInfo').default;
      
      render(<UserInfo />);
      
      // Verify localStorage was called
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      
      // Get all text elements
      const textElements = screen.getAllByTestId('text');
      
      // Verify default values are used for null localStorage values
      expect(textElements[0].textContent).toContain('N/A');
      expect(textElements[1].textContent).toContain('N/A');
      expect(textElements[2].textContent).toContain('Workspace - N/A');
    });
  });
}); 