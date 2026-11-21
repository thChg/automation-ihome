import { createContext } from 'react'
import type { SessionUser } from '../api'

export type AuthContextValue = {
  user: SessionUser | null
  sessionLoading: boolean
  setUser: (user: SessionUser | null) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
