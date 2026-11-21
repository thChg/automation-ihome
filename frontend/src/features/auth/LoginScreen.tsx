import { useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { authApi } from '../../api'
import { useAuth } from '../../context'
import './LoginScreen.css'

export function LoginScreen() {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await authApi.login({ email, password })
      setUser(response.data.user)
    } catch (loginError) {
      if (loginError instanceof AxiosError) {
        const message = loginError.response?.data?.message
        setError(typeof message === 'string' ? message : 'Đăng nhập thất bại')
      } else {
        setError('Không thể kết nối đến máy chủ')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">iH</span>
          <div>
            <p className="eyebrow">iHome Automation</p>
            <p className="brand-subtitle">Hệ thống quản lý</p>
          </div>
        </div>

        <header>
          <h1>Đăng nhập</h1>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-button" type="submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  )
}
