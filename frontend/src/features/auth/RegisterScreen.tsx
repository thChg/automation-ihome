import { useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Link } from 'react-router-dom'
import { authApi } from '../../api'
import './LoginScreen.css'

export function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await authApi.register({ email, password })
      setSuccess('Đã gửi yêu cầu. Tài khoản đang chờ quản trị viên phê duyệt.')
      setPassword('')
    } catch (registerError) {
      if (registerError instanceof AxiosError) {
        const message = registerError.response?.data?.message
        setError(typeof message === 'string' ? message : 'Không thể gửi yêu cầu tài khoản')
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
          <h1>Yêu cầu tài khoản</h1>
          <p>Tài khoản user sẽ chờ admin phê duyệt</p>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}
          {success && <p className="login-success" role="status">{success}</p>}

          <button className="login-button" type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý…' : 'Gửi yêu cầu'}
          </button>
          <Link className="mode-button" to="/login">Quay lại đăng nhập</Link>
        </form>
      </section>
    </main>
  )
}
