import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context'

export function ProtectedRoute() {
  const { user, sessionLoading } = useAuth()
  const location = useLocation()

  if (sessionLoading) {
    return <main className="app-shell"><div className="status-dot loading" /></main>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
