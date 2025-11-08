import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import styles from './OnboardingWizard.module.css'
import { useAuth } from '../../state/authContext'
import { authApi } from '../../services/api'

const BUSINESS_TYPES = ['retail', 'market', 'grocery', 'salon', 'home', 'other'] as const
type BusinessType = (typeof BUSINESS_TYPES)[number]
const BUSINESS_LABELS: Record<BusinessType, string> = {
  retail: 'Retail shop',
  market: 'Market - fruits & vegetables',
  grocery: 'Grocery store',
  salon: 'Salon / barber',
  home: 'Home-based business',
  other: 'Other',
}

const PRODUCT_OPTIONS = ['vegetables', 'fruits', 'dry-goods', 'dairy', 'meat', 'beverages', 'clothing', 'household'] as const
type ProductOption = (typeof PRODUCT_OPTIONS)[number]
const PRODUCT_LABELS: Record<ProductOption, string> = {
  vegetables: 'Leafy vegetables',
  fruits: 'Fruits',
  'dry-goods': 'Dry goods',
  dairy: 'Dairy products',
  meat: 'Meat & fish',
  beverages: 'Beverages',
  clothing: 'Clothing',
  household: 'Household supplies',
}

const CHALLENGES = ['bookkeeping', 'pricing', 'spoilage', 'low-demand', 'competition', 'capital'] as const
type ChallengeOption = (typeof CHALLENGES)[number]
const CHALLENGE_LABELS: Record<ChallengeOption, string> = {
  bookkeeping: 'Keeping accurate records',
  pricing: 'Setting the right prices',
  spoilage: 'Products going bad',
  'low-demand': 'Not enough customers',
  competition: 'Heavy competition',
  capital: 'Limited capital',
}

const GOALS = ['increase-sales', 'reduce-loss', 'gain-customers', 'improve-service', 'better-planning', 'hit-targets', 'expand-business'] as const
type GoalOption = (typeof GOALS)[number]
const GOAL_LABELS: Record<GoalOption, string> = {
  'increase-sales': 'Increase sales',
  'reduce-loss': 'Reduce losses',
  'gain-customers': 'Gain customers',
  'improve-service': 'Improve service',
  'better-planning': 'Better financial planning',
  'hit-targets': 'Hit financial targets',
  'expand-business': 'Expand the business',
}

const DISPLAY_OPTIONS = ['charts', 'text', 'table'] as const
type DisplayOption = (typeof DISPLAY_OPTIONS)[number]
const DISPLAY_OPTION_COPY: Record<DisplayOption, { title: string; description: string }> = {
  charts: { title: 'Charts & graphs', description: 'Visual insights showing sales trends' },
  text: { title: 'Simple text', description: 'Highlights explained in plain words' },
  table: { title: 'Data table', description: 'Rows and columns with detailed figures' },
}

const copy = {
  welcomeTitle: 'Welcome! Let’s get to know you',
  welcomeSubtitle: 'Tell us a little about yourself.',
  nameLabel: 'What is your name?',
  phoneLabel: 'Phone number (optional)',
  phoneHint: 'We will only use this for important alerts.',
  next: 'Continue',
  back: 'Back',
  skip: 'Skip and start using the app',
  finish: 'Finish',
  stepLabel: (step: number, total: number) => `Step ${step} of ${total}`,
  businessTitle: 'Business Type',
  businessSubtitle: 'What kind of business do you run?',
  productTitle: 'Your Products',
  productSubtitle: 'Choose the categories you sell (select all that apply)',
  selectedProductsLabel: 'Products selected',
  noProductsLabel: 'No products selected yet',
  challengesTitle: 'Challenges & Goals',
  challengesSubtitle: 'Which challenges do you face? (select all that apply)',
  goalSubtitle: 'What goals are you working towards? (select all that apply)',
  displayTitle: 'Display Preferences',
  displaySubtitle: 'How would you like to view your insights?',
  summaryTitle: (name: string) => `Congratulations, ${name || 'friend'}!`,
  summarySubtitle: 'Your preferences are saved. Welcome to your workspace!',
  summaryListLabel: {
    business: 'Selected business type',
    products: 'Chosen products',
    display: 'Display option',
  },
  startApp: 'Start using the app',
}

const totalSteps = 5

const toggleMultiSelect = <T extends string>(value: T, setState: Dispatch<SetStateAction<T[]>>, limit?: number) => {
  setState((prev) => {
    if (prev.includes(value)) {
      return prev.filter((item) => item !== value)
    }
    if (limit && prev.length >= limit) {
      return prev
    }
    return [...prev, value]
  })
}

const OnboardingWizard = () => {
  const navigate = useNavigate()
  const { markOnboardingStatus } = useAuth()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType | ''>('')
  const [products, setProducts] = useState<ProductOption[]>([])
  const [challenges, setChallenges] = useState<ChallengeOption[]>([])
  const [goals, setGoals] = useState<GoalOption[]>([])
  const [display, setDisplay] = useState<DisplayOption>('charts')

  const progressPercent = Math.min(Math.round(((Math.min(step, totalSteps) + 1) / (totalSteps + 1)) * 100), 100)
  const isSummary = step >= totalSteps

  const handleSkip = () => {
    markOnboardingStatus('skipped')
    navigate('/dashboard', { replace: true })
  }

  const handleFinish = async () => {
    try {
      // Save onboarding data to backend
      if (businessType) {
        await authApi.completeOnboarding({
          business_type: businessType,
          products_of_interest: products,
          challenges: challenges,
          goals: goals,
          display_mode: display,
          language: 'en', // Default to English for now
        })
      }

      markOnboardingStatus('completed')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
      // Still navigate to dashboard even if saving fails
      // The user can update their preferences in settings later
      markOnboardingStatus('completed')
      navigate('/dashboard', { replace: true })
    }
  }

  const goNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className={styles.card}>
            <span className={styles.stepIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="16" r="8" />
                <path d="M10 40c0-7.7 6.3-14 14-14s14 6.3 14 14" />
              </svg>
            </span>
            <h2 className={styles.cardTitle}>{copy.welcomeTitle}</h2>
            <p className={styles.cardSubtitle}>{copy.welcomeSubtitle}</p>

            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>{copy.nameLabel}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={styles.input}
                placeholder="Your first name"
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>{copy.phoneLabel}</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={styles.input}
                placeholder="e.g. +254712345678"
              />
              <span className={styles.fieldHint}>{copy.phoneHint}</span>
            </label>
          </div>
        )

      case 1:
        return (
          <div className={styles.card}>
            <span className={styles.stepIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 18h28v22H10z" />
                <path d="M14 10h20v8H14z" />
              </svg>
            </span>
            <h2 className={styles.cardTitle}>{copy.businessTitle}</h2>
            <p className={styles.cardSubtitle}>{copy.businessSubtitle}</p>
            <div className={styles.buttonGrid}>
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.optionButton} ${businessType === type ? styles.optionButtonActive : ''}`}
                  onClick={() => setBusinessType(type)}
                  aria-pressed={businessType === type}
                >
                  {BUSINESS_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className={styles.card}>
            <span className={styles.stepIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 38h28l-4-24H14l-4 24z" />
                <path d="M20 38v-8h8v8" />
              </svg>
            </span>
            <h2 className={styles.cardTitle}>{copy.productTitle}</h2>
            <p className={styles.cardSubtitle}>{copy.productSubtitle}</p>
            <div className={styles.buttonGrid}>
              {PRODUCT_OPTIONS.map((product) => (
                <button
                  key={product}
                  type="button"
                  className={`${styles.optionButton} ${products.includes(product) ? styles.optionButtonActive : ''}`}
                  onClick={() => toggleMultiSelect(product, setProducts)}
                  aria-pressed={products.includes(product)}
                >
                  {PRODUCT_LABELS[product]}
                </button>
              ))}
            </div>
            <div className={styles.selectionSummary}>
              <span className={styles.selectionLabel}>
                {products.length ? copy.selectedProductsLabel : copy.noProductsLabel}
              </span>
              {products.length > 0 && (
                <div className={styles.selectionTags}>
                  {products.map((item) => (
                    <span key={item} className={styles.selectionTag}>
                      {PRODUCT_LABELS[item]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className={styles.card}>
            <span className={styles.stepIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="#ef6700" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="12" r="6" />
                <circle cx="24" cy="36" r="10" />
              </svg>
            </span>
            <h2 className={styles.cardTitle}>{copy.challengesTitle}</h2>
            <p className={styles.cardSubtitle}>{copy.challengesSubtitle}</p>
            <div className={styles.buttonGrid}>
              {CHALLENGES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.optionButton} ${challenges.includes(item) ? styles.optionButtonActive : ''}`}
                  onClick={() => toggleMultiSelect(item, setChallenges)}
                  aria-pressed={challenges.includes(item)}
                >
                  {CHALLENGE_LABELS[item]}
                </button>
              ))}
            </div>
            <p className={styles.cardSubtitle}>{copy.goalSubtitle}</p>
            <div className={styles.buttonGrid}>
              {GOALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.optionButton} ${goals.includes(item) ? styles.optionButtonActive : ''}`}
                  onClick={() => toggleMultiSelect(item, setGoals)}
                  aria-pressed={goals.includes(item)}
                >
                  {GOAL_LABELS[item]}
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className={styles.card}>
            <span className={styles.stepIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 40h36" />
                <path d="M12 30v10" />
                <path d="M24 16v24" />
                <path d="M36 24v16" />
              </svg>
            </span>
            <h2 className={styles.cardTitle}>{copy.displayTitle}</h2>
            <p className={styles.cardSubtitle}>{copy.displaySubtitle}</p>
            <div className={styles.buttonColumn}>
              {DISPLAY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.displayOption} ${display === option ? styles.displayOptionActive : ''}`}
                  onClick={() => setDisplay(option)}
                  aria-pressed={display === option}
                >
                  <span aria-hidden className={styles.displayIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h18v18H3z" />
                    </svg>
                  </span>
                  <div>
                    <p className={styles.optionTitle}>{DISPLAY_OPTION_COPY[option].title}</p>
                    <p className={styles.optionDescription}>{DISPLAY_OPTION_COPY[option].description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon} aria-hidden>
              <svg viewBox="0 0 64 64" fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="32" r="26" />
                <path d="M20 34 28 42 44 26" />
              </svg>
            </span>
            <h2 className={styles.summaryTitle}>{copy.summaryTitle(name)}</h2>
            <p className={styles.summarySubtitle}>{copy.summarySubtitle}</p>

            <div className={styles.summaryHighlights}>
              <div>
                <p className={styles.summaryHeading}>{copy.summaryListLabel.business}</p>
                <p className={styles.summaryValue}>{businessType ? BUSINESS_LABELS[businessType] : '–'}</p>
              </div>
              <div>
                <p className={styles.summaryHeading}>{copy.summaryListLabel.products}</p>
                <p className={styles.summaryValue}>
                  {products.length ? products.map((item) => PRODUCT_LABELS[item]).join(', ') : '–'}
                </p>
              </div>
              <div>
                <p className={styles.summaryHeading}>{copy.summaryListLabel.display}</p>
                <p className={styles.summaryValue}>{DISPLAY_OPTION_COPY[display].title}</p>
              </div>
            </div>

            <Button onClick={handleFinish}>{copy.startApp}</Button>
          </div>
        )
    }
  }

  const canContinue = () => {
    switch (step) {
      case 0:
        return name.trim().length > 0
      case 1:
        return Boolean(businessType)
      case 2:
        return products.length > 0
      case 3:
        return goals.length > 0 || challenges.length > 0
      case 4:
        return Boolean(display)
      default:
        return true
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.stepMetadata}>
          <p className={styles.stepLabel}>{copy.stepLabel(Math.min(step + 1, totalSteps), totalSteps)}</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className={styles.progressValue} aria-hidden>
          <span className={styles.progressNumber}>{progressPercent}</span>
          <span className={styles.progressUnit}>%</span>
        </div>
      </header>

      <main className={styles.main}>{stepContent()}</main>

      {!isSummary && (
        <footer className={styles.footer}>
          <div className={styles.footerActions}>
            <Button variant="ghost" onClick={goBack} disabled={step === 0}>
              {copy.back}
            </Button>
            <div className={styles.actionGroup}>
              <button type="button" className={styles.skipLink} onClick={handleSkip}>
                {copy.skip}
              </button>
              <Button onClick={goNext} disabled={!canContinue()}>
                {step === totalSteps - 1 ? copy.finish : copy.next}
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default OnboardingWizard
