import Button from '../../components/Button'
import styles from './LandingPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/authContext'

const features = [
  {
    title: 'See trends instantly',
    copy: 'Track sales, spoilage, and inventory turnover on one clean dashboard tailored to your KPIs.',
  },
  {
    title: 'Decide with confidence',
    copy: 'Your onboarding choices personalise alerts and summaries so you focus on what matters.',
  },
  {
    title: 'Grow every channel',
    copy: 'Spot opportunities across wholesale, retail, and delivery with quick snapshots and alerts.',
  },
]

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, onboardingStatus, signIn, signUp, markOnboardingStatus } = useAuth()

  const goToPrimaryAction = () => {
    if (!isAuthenticated) {
      const status = signIn()
      if (status !== 'completed') {
        markOnboardingStatus('completed')
      }
    }

    navigate('/dashboard')
  }

  const goToSecondaryAction = () => {
    if (!isAuthenticated) {
      signUp()
    } else if (onboardingStatus !== 'pending') {
      markOnboardingStatus('pending')
    }

    navigate('/onboarding')
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Run your fruit business with clarity.</h1>
          <p className={styles.subtitle}>
            Fruit Vendor keeps your team aligned on the metrics that matter—from daily sales to stock freshness—so you act fast and grow smarter.
          </p>
          <div className={styles.ctaGroup}>
            <Button onClick={goToPrimaryAction}>
              {isAuthenticated ? 'Continue to your workspace' : 'Sign in'}
            </Button>
            <Button variant="secondary" onClick={goToSecondaryAction}>
              {isAuthenticated ? 'Review onboarding' : 'Create an account'}
            </Button>
          </div>
          {!isAuthenticated && (
            <p className={styles.secondaryAction}>
              New here? <button type="button" onClick={goToSecondaryAction}>Get started in minutes</button>
            </p>
          )}
        </section>

        <section className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <h2 className={styles.featureTitle}>{feature.title}</h2>
              <p className={styles.featureCopy}>{feature.copy}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default LandingPage
