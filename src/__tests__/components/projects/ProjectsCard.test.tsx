// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import ProjectsCard from '../../../components/projects/ProjectsCard';
import { PATHS } from '@/constants/paths';

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock('@/utils/commonFunction', () => ({
  formatProjectDate: () => 'Formatted Date',
}));
jest.mock('@/constants/endpoint', () => 'http://localhost/v1');

// Minimal Project type for test
const baseProject = {
  id: '1',
  name: 'Test Project',
  description: 'Description',
  created_at: '2024-01-01',
  created_by: '',
  deleted_at: null,
  environment: '',
  members: [],
  status: '',
  updated_at: '',
  workspace_id: '',
  organization_id: '',
  project_id: '',
  updated_by: '',
};

describe('ProjectsCard', () => {
  const renderWithProvider = (ui) => render(<MantineProvider>{ui}</MantineProvider>);

  beforeEach(() => {
    // Clear mock calls before each test
    mockNavigate.mockClear();
  });

  it('renders project name, description, and formatted date', () => {
    renderWithProvider(<ProjectsCard project={baseProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Formatted Date')).toBeInTheDocument();
  });

  it('renders the project icon correctly', () => {
    renderWithProvider(<ProjectsCard project={baseProject} />);
    // Check for the ThemeIcon wrapper
    const themeIcon = document.querySelector('.mantine-ThemeIcon-root');
    expect(themeIcon).toBeInTheDocument();
    
    // Check that the icon is rendered inside the ThemeIcon
    const svgIcon = themeIcon.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('shows fallback for missing description', () => {
    renderWithProvider(<ProjectsCard project={{ ...baseProject, description: '' }} />);
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('shows fallback for null description', () => {
    renderWithProvider(<ProjectsCard project={{ ...baseProject, description: null }} />);
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('shows fallback for undefined description', () => {
    renderWithProvider(<ProjectsCard project={{ ...baseProject, description: undefined }} />);
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('handles long descriptions appropriately', () => {
    const longDescription = 'This is a very long description that should be truncated. '.repeat(10);
    renderWithProvider(<ProjectsCard project={{ ...baseProject, description: longDescription }} />);
    
    // Check that the description element exists and has the correct class
    const descriptionElement = screen.getByText(/This is a very long description/i);
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.className).toContain('description');
    
    // Verify the lineClamp prop is passed to the Text component
    expect(descriptionElement.hasAttribute('data-line-clamp')).toBe(true);
  });

  it('handles projects with very long names correctly', () => {
    const longNameProject = { ...baseProject, name: 'This is a very long project name that might need special handling '.repeat(3) };
    renderWithProvider(<ProjectsCard project={longNameProject} />);
    
    // Verify the long name is rendered
    expect(screen.getByText(/This is a very long project name/i)).toBeInTheDocument();
  });

  it('navigates to the correct project detail page on card click', () => {
    renderWithProvider(<ProjectsCard project={baseProject} />);
    
    // Find and click the card
    const card = document.querySelector('.mantine-Card-root');
    fireEvent.click(card);
    
    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: PATHS.PROJECT_DETAIL,
      params: { projectId: '1' },
    });
  });

  it('handles projects with different id formats correctly', () => {
    // Test with a numeric id
    const numericIdProject = { ...baseProject, id: 42 };
    renderWithProvider(<ProjectsCard project={numericIdProject} />);
    
    const card = document.querySelector('.mantine-Card-root');
    fireEvent.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith({
      to: PATHS.PROJECT_DETAIL,
      params: { projectId: '42' },
    });
  });

  it('handles undefined created_at date gracefully', () => {
    renderWithProvider(<ProjectsCard project={{ ...baseProject, created_at: undefined }} />);
    expect(screen.getByText('Formatted Date')).toBeInTheDocument();
  });

  it('renders correctly with minimal project data', () => {
    // Create a minimal project with only required properties
    const minimalProject = { id: '99', name: 'Minimal Project' };
    renderWithProvider(<ProjectsCard project={minimalProject} />);
    
    // Should render the name
    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    
    // Should show fallback for description
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('applies the correct CSS classes for styling', () => {
    renderWithProvider(<ProjectsCard project={baseProject} />);
    
    // Check that the card has the correct class
    const card = document.querySelector('.mantine-Card-root');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('card');
    
    // Check that the name has the correct class
    const name = screen.getByText('Test Project');
    expect(name.className).toContain('name');
    
    // Check that the description has the correct class
    const description = screen.getByText('Description');
    expect(description.className).toContain('description');
    
    // Check that the status/date has the correct class
    const date = screen.getByText('Formatted Date');
    expect(date.className).toContain('status');
  });

  it('handles undefined project properties gracefully', () => {
    // Create a project with undefined values for some properties
    const incompleteProject = { ...baseProject, description: undefined, created_at: undefined };
    renderWithProvider(<ProjectsCard project={incompleteProject} />);
    
    // Should show fallback for description
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
    
    // formatProjectDate should handle undefined date
    // Since we mocked it to always return 'Formatted Date', we just check it's called
    expect(screen.getByText('Formatted Date')).toBeInTheDocument();
  });
});
