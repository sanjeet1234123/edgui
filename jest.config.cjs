module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // Handle SVG imports consistently
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.svg\\?react$': '<rootDir>/__mocks__/svgMock.js',
    // Path alias
    '^@/(.*)$': '<rootDir>/src/$1',
    // CSS modules and styles - more comprehensive mapping
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock specific CSS modules that might cause issues
    '@/components/.*/.*\\.module\\.css$': 'identity-obj-proxy',
    // Mock the endpoint file to avoid import.meta issues
    '^@/constants/endpoint$': '<rootDir>/__mocks__/endpointMock.js',
    '^react-markdown$': '<rootDir>/__mocks__/reactMarkdownMock.js',
    '^remark-gfm$': '<rootDir>/__mocks__/remarkGfmMock.js',
    '^rehype-raw$': '<rootDir>/__mocks__/rehypeRawMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/reportWebVitals.ts',
  ],
  // Configure test environment
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark-gfm|rehype-raw|@mantine/core|@mantine/hooks|@tabler/icons-react)/)',
  ],
  // Add timeout configurations to prevent hanging
  testTimeout: 10000, // 10 seconds max per test
  // Detect open handles to help debug hanging tests
  detectOpenHandles: true,
  // Force exit after tests complete
  forceExit: true,
  // Clear mocks automatically
  clearMocks: true,
}
