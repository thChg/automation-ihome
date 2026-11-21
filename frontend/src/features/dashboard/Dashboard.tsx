import { useEffect, useState } from 'react'
import { healthApi } from '../../api'
import { useAuth } from '../../context'
import './Dashboard.css'

type HealthStatus = 'loading' | 'healthy' | 'unhealthy'

export function Dashboard() {
  const { user, logout } = useAuth()
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading')

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
        <button className="logout-button" type="button" onClick={handleLogout}>Đăng xuất</button>
      </section>
    </main>
  )
}
