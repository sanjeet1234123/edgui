export interface Feature {
  title: string
  description: string
  status: string
  eta: string
  section: string
}

export const features: Array<Feature> = [
  // Dashboard Features
  {
    title: 'Interactive Dashboard Analytics',
    description:
      'Real-time analytics dashboard with customizable widgets and metrics visualization',
    status: 'Coming Soon',
    eta: 'Q1 2025',
    section: 'Dashboard',
  },
  {
    title: 'Performance Monitoring',
    description:
      'Advanced system performance tracking and resource utilization metrics',
    status: 'In Development',
    eta: 'Q2 2025',
    section: 'Dashboard',
  },
  // Database Features
  {
    title: 'Multi-Database Support',
    description:
      'Extended support for various database types including NoSQL and Time-series databases',
    status: 'Planning',
    eta: 'Q2 2025',
    section: 'Database',
  },
  {
    title: 'Automated Backup System',
    description:
      'Scheduled backups with version control and instant recovery options',
    status: 'In Development',
    eta: 'Q1 2025',
    section: 'Database',
  },
  // Marketplace Features
  {
    title: 'Plugin Marketplace',
    description:
      'Browse and install custom plugins and extensions for enhanced functionality',
    status: 'Coming Soon',
    eta: 'Q1 2025',
    section: 'Marketplace',
  },
  {
    title: 'Community Templates',
    description: 'Share and use community-created templates and workflows',
    status: 'Planning',
    eta: 'Q2 2025',
    section: 'Marketplace',
  },
  // Model Features
  {
    title: 'AI Model Integration',
    description: 'Seamless integration with popular AI and ML models',
    status: 'In Development',
    eta: 'Q1 2025',
    section: 'Model',
  },
  {
    title: 'Model Version Control',
    description: 'Track and manage different versions of your AI/ML models',
    status: 'Planning',
    eta: 'Q2 2025',
    section: 'Model',
  },
  // Settings Features
  {
    title: 'Advanced Role Management',
    description: 'Granular control over user roles and permissions',
    status: 'Coming Soon',
    eta: 'Q1 2025',
    section: 'Settings',
  },
  {
    title: 'Custom Notifications',
    description:
      'Configurable notification system with multiple channels support',
    status: 'In Development',
    eta: 'Q2 2025',
    section: 'Settings',
  },
  // Workflow Features
  {
    title: 'Workflow Automation',
    description: 'Create and automate complex workflows with visual builder',
    status: 'Coming Soon',
    eta: 'Q1 2025',
    section: 'Workflow',
  },
  {
    title: 'Workflow Analytics',
    description:
      'Track and optimize your workflow performance with detailed analytics',
    status: 'Planning',
    eta: 'Q2 2025',
    section: 'Workflow',
  },
  // Workspace Features
  {
    title: 'Collaborative Workspace',
    description: 'Real-time collaboration tools with team management features',
    status: 'In Development',
    eta: 'Q1 2025',
    section: 'Workspace',
  },
  {
    title: 'Resource Management',
    description: 'Efficient allocation and monitoring of workspace resources',
    status: 'Planning',
    eta: 'Q2 2025',
    section: 'Workspace',
  },
]
