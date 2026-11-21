import { useEffect, useState } from 'react'
import { healthApi, usersApi } from '../../api'
import type { ManagedUser } from '../../api'
import { useAuth } from '../../context'
import './Dashboard.css'

type HealthStatus = 'loading' | 'healthy' | 'unhealthy'

export function Dashboard() {
  const { user, logout } = useAuth()
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading')
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])

  useEffect(() => {
    let active = true

    async function checkHealth() {
      setHealthStatus('loading')
      try {
        const response = await healthApi.get()
        if (active) {
          setHealthStatus(response.data.status === 'ok' ? 'healthy' : 'unhealthy')
        }
      } catch {
        if (active) setHealthStatus('unhealthy')
      }
    }

    void checkHealth()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return

    let active = true
    async function loadUsers() {
      try {
        const response = await usersApi.list()
        if (active) setManagedUsers(response.data)
      } catch {
        if (active) setManagedUsers([])
      }
    }

    void loadUsers()
    return () => { active = false }
  }, [user])

  async function refreshUsers() {
    const response = await usersApi.list()
    setManagedUsers(response.data)
  }

  async function handleApprove(id: number) {
    await usersApi.approve(id)
    await refreshUsers()
  }

  async function handleReject(id: number) {
    await usersApi.reject(id)
    await refreshUsers()
  }

  async function handleRemove(id: number) {
    await usersApi.remove(id)
    await refreshUsers()
  }

  async function handleLogout() {
    await logout()
  }

  if (!user) return null

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div>
          <p className="eyebrow">Xin chào</p>
          <h1>{user.email}</h1>
        </div>
        <div className="health-card" aria-live="polite">
          <div className={`status-dot ${healthStatus}`} />
          <div>
            <p className="eyebrow">Backend status</p>
            <strong>
              {healthStatus === 'loading' && 'Đang kiểm tra…'}
              {healthStatus === 'healthy' && 'Hệ thống hoạt động'}
              {healthStatus === 'unhealthy' && 'Backend không khả dụng'}
            </strong>
          </div>
        </div>
        {user.role === 'admin' && (
          <section className="users-panel">
            <div className="users-heading">
              <h2>Quản lý người dùng</h2>
              <button type="button" onClick={refreshUsers}>Làm mới</button>
            </div>
            <div className="users-list">
              {managedUsers.map((managedUser) => (
                <article className="user-row" key={managedUser.id}>
                  <div>
                    <strong>{managedUser.email}</strong>
                    <p>{managedUser.role} · {managedUser.status}</p>
                  </div>
                  {managedUser.role === 'user' && managedUser.status === 'pending' && (
                    <div className="user-actions">
                      <button type="button" className="approve" onClick={() => void handleApprove(managedUser.id)}>Phê duyệt</button>
                      <button type="button" className="reject" onClick={() => void handleReject(managedUser.id)}>Từ chối</button>
                    </div>
                  )}
                  {managedUser.role === 'user' && (
                    <button type="button" className="remove" onClick={() => void handleRemove(managedUser.id)}>Xóa</button>
                  )}
                </article>
              ))}
              {managedUsers.length === 0 && <p>Chưa có người dùng.</p>}
            </div>
          </section>
        )}
        <button className="logout-button" type="button" onClick={handleLogout}>Đăng xuất</button>
      </section>
    </main>
  )
}
