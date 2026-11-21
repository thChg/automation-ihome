import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context'
import './AppLayout.css'

export function AppLayout() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')

  function toggleSidebar() {
    setCollapsed((current) => {
      localStorage.setItem('sidebar-collapsed', String(!current))
      return !current
    })
  }

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <NavLink className="sidebar-brand" to="/" aria-label="iHome Automation dashboard">
          <span className="brand-icon">iH</span>
          <span className="brand-name">iHome Automation</span>
        </NavLink>

        <nav className="sidebar-menu" aria-label="Main navigation">
          <NavLink to="/" end>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
            </svg>
            <span>Dashboard</span>
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/users">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
              </svg>
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <button
          className="sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={collapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'} />
          </svg>
        </button>

        <NavLink className="profile-link" to="/profile" aria-label="Open profile" title="Profile">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z" />
          </svg>
          <span>{user?.email}</span>
        </NavLink>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
