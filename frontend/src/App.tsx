import { useEffect, useState } from 'react'
import './App.css'

type HealthStatus = 'loading' | 'healthy' | 'unhealthy'

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      setHealthStatus('loading')

      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as { status?: string }
        setHealthStatus(data.status === 'ok' ? 'healthy' : 'unhealthy')
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setHealthStatus('unhealthy')
        }
      }
    }

    void checkHealth()

    return () => controller.abort()
  }, [])

  return (
    <main className="app-shell">
      <section className="health-card" aria-live="polite">
        <div className={`status-dot ${healthStatus}`} />
        <div>
          <p className="eyebrow">Backend status</p>
          <h1>
            {healthStatus === 'loading' && 'Checking…'}
            {healthStatus === 'healthy' && 'System operational'}
            {healthStatus === 'unhealthy' && 'Backend unavailable'}
          </h1>
        </div>
      </section>
    </main>
  )
}

export default App
