import { useEffect, useState } from 'react'
import { usersApi } from '../../api'
import type { ManagedUser } from '../../api'
import './UsersPage.css'

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const response = await usersApi.list()
      setUsers(response.data)
    } catch {
      setError('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialUsers() {
      try {
        const response = await usersApi.list()
        if (active) setUsers(response.data)
      } catch {
        if (active) setError('Không thể tải danh sách người dùng')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialUsers()
    return () => { active = false }
  }, [])

  async function handleApprove(id: number) {
    await usersApi.approve(id)
    await loadUsers()
  }

  async function handleReject(id: number) {
    await usersApi.reject(id)
    await loadUsers()
  }

  async function handleRemove(id: number) {
    await usersApi.remove(id)
    await loadUsers()
  }

  return (
    <section className="users-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Users</h1>
        </div>
        <button type="button" onClick={() => void loadUsers()}>Làm mới</button>
      </header>

      {loading && <p>Đang tải…</p>}
      {error && <p className="page-error" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="users-table">
          {users.map((managedUser) => (
            <article className="user-row" key={managedUser.id}>
              <div className="user-summary">
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
          {users.length === 0 && <p>Chưa có người dùng.</p>}
        </div>
      )}
    </section>
  )
}
