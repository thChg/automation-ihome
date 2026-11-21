export const apiEndpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  users: '/users',
  health: '/health',
} as const
