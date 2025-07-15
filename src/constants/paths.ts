/**
 * Application route paths
 * Centralized location for all route paths
 */

export const PATHS = {
  COUNTER: '/counter',

  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  CONFIRM_EMAIL: '/confirm-email',
  FORGOT_PASSWORD: '/forgot-password',
  FORGOT_WORKSPACE: '/forgot-workspace',
  MEMBER_LOGIN: '/member-login',
  MEMBER_SIGNUP: '/member-signup',
  MEMBER_REGISTRATION: '/member-registration',
  PROJECT_ONBOARDING: '/project-onboarding',

  // Platform setup
  PLATFORM_SETUP: '/platform-setup',

  // Main routes
  ACCOUNTS: '/accounts',
  ADD_CLUSTER: '/add-cluster',
  CLUSTERS: '/clusters',
  CONFIG: '/config',
  DEFAULT: '',
  DEPLOYMENT: '/deployment',
  DEPLOYMENTS: '/deployments',
  MARKETPLACE: '/marketplace',
  SERVERS: '/servers',
  SERVERS_DETAIL: '/server/$serverId',
  PLAYGROUND: '/playground',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/project/$projectId',
  WORKSPACE: '/workspace',
  ACCOUNT_SETTINGS: '/settings',

  // Not found route
  NOT_FOUND: '*',
}
