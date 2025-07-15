// @ts-nocheck
// Test skeleton for ProjectsHeader
import { render, screen } from '@testing-library/react';
import ProjectsHeader from '../../../components/projects/ProjectsHeader';
import { MantineProvider } from '@mantine/core';

jest.mock('@/constants/endpoint', () => 'http://localhost/v1');

describe('ProjectsHeader', () => {
  it('renders with pageTitle', () => {
    render(
      <MantineProvider>
        <ProjectsHeader pageTitle="My Projects" />
      </MantineProvider>
    );
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });
});
