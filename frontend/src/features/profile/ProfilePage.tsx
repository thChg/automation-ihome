import { useAuth } from '../../context'
import './ProfilePage.css'

export function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <section className="profile-page">
      <p className="eyebrow">Profile</p>
      <h1>{user.email}</h1>
      <p>Role: {user.role}</p>
      <button className="logout-button" type="button" onClick={() => void logout()}>
        Đăng xuất
      </button>
    </section>
  )
}
