// @ts-nocheck
// Test skeleton for ProjectsFallback
import { render, screen } from '@testing-library/react';
import ProjectsFallback from '../../../components/projects/ProjectsFallback';
import { MantineProvider } from '@mantine/core';

jest.mock('@/constants/endpoint', () => 'http://localhost/v1');

describe('ProjectsFallback', () => {
  it('renders skeletons and grid', () => {
    render(
  <MantineProvider>
    <ProjectsFallback />
  </MantineProvider>
);

    // Check for Mantine Skeleton elements by class
    expect(document.querySelectorAll('.mantine-Skeleton-root').length).toBeGreaterThan(0);
  });
});
