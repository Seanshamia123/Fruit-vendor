import { useState } from 'react'
import Button from './Button'
import type { LoginCredentials, VendorCreate } from '../services/types'

type AuthModalProps = {
  mode: 'login' | 'register'
  onClose: () => void
  onSubmit: (data: LoginCredentials | VendorCreate) => Promise<void>
}

export const AuthModal = ({ mode, onClose, onSubmit }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState<VendorCreate>({
    name: '',
    email: '',
    contact: '',
    password: '',
    location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const data = mode === 'login' ? loginData : registerData
      await onSubmit(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={registerData.contact}
                  onChange={(e) => setRegisterData({ ...registerData, contact: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={registerData.location}
                  onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={mode === 'login' ? loginData.username : registerData.email}
              onChange={(e) =>
                mode === 'login'
                  ? setLoginData({ ...loginData, username: e.target.value })
                  : setRegisterData({ ...registerData, email: e.target.value })
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={mode === 'login' ? loginData.password : registerData.password}
              onChange={(e) =>
                mode === 'login'
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setRegisterData({ ...registerData, password: e.target.value })
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#fee',
                color: '#c00',
                borderRadius: '4px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" disabled={isLoading} style={{ flex: 1 }}>
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
