import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import styles from './AuthPage.module.css'
import { useAuth } from '../../state/authContext'
import { useOnboarding } from '../../state/onboardingContext'

const SignUp = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { reset } = useOnboarding()
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || !business || !email || !password) {
      setError('Fill in every field so we can tailor your onboarding experience.')
      return
    }

    setError(null)
    signUp()
    reset()
    navigate('/onboarding/metrics', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create your workspace</h1>
          <p className={styles.subtitle}>Tell us about your fruit business so we can highlight the KPIs that matter most.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="business">Business name</label>
            <input
              id="business"
              name="business"
              autoComplete="organization"
              required
              className={styles.input}
              value={business}
              onChange={(event) => setBusiness(event.currentTarget.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sign-up-email">Work email</label>
            <input
              id="sign-up-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sign-up-password">Password</label>
            <input
              id="sign-up-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            <p className={styles.helper}>We will use this to keep your workspace secure. You can update it later.</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button type="submit">Create account</Button>
            <p className={styles.altAction}>
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/sign-in')}>Sign in instead</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp
