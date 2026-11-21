export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  health: '/health',
} as const
