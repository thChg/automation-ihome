import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { authApi } from '../api'
import type { SessionUser } from '../api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const response = await authApi.me()
        if (active) setUser(response.data)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setSessionLoading(false)
      }
    }

    void loadSession()
    return () => { active = false }
  }, [])

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, sessionLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
