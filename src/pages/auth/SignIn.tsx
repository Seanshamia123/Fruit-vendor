import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import styles from './AuthPage.module.css'
import { useAuth } from '../../state/authContext'

type LocationState = {
  from?: string
}

const SignIn = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setError(null)
    const onboardingStatus = signIn()
    const redirectState = (location.state as LocationState | undefined)?.from
    const destination = onboardingStatus === 'pending' ? '/onboarding/metrics' : redirectState ?? '/dashboard'

    navigate(destination, { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to review your KPIs and keep fruit operations running smoothly.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <p className={styles.helper}>Use the email associated with your Fruit Vendor workspace.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button type="submit">Sign in</Button>
            <p className={styles.altAction}>
              Need an account?{' '}
              <button type="button" onClick={() => navigate('/sign-up')}>Create one now</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn
