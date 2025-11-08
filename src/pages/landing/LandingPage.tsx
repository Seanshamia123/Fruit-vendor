import { useState } from 'react'
import { AuthModal } from '../../components/AuthModal'
import styles from './LandingPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/authContext'
import type { LoginCredentials, VendorCreate } from '../../services/types'

const metrics = [
  { label: 'Business Owners', value: '500+' },
  { label: 'Monthly Sales', value: '50K+' },
  { label: 'Profit Increase', value: '30%' },
]

const features = [
  {
    title: 'Inventory Management',
    copy: 'Track your products easily and get real-time updates.',
  },
  {
    title: 'Spoilage Alerts',
    copy: 'Receive alerts before products spoil so you can reduce losses.',
  },
  {
    title: 'Quick Sales',
    copy: 'Record sales quickly with a complete transaction history.',
  },
  {
    title: 'Business Analytics',
    copy: 'View sales graphs and analyze your revenue trends.',
  },
  {
    title: 'M-Pesa Payments',
    copy: 'Accept secure payments directly with M-Pesa STK Push.',
  },
  {
    title: 'Pricing Strategies',
    copy: 'Set custom prices and bonus rules for loyal customers.',
  },
]

const steps = [
  {
    title: 'Sign Up',
    copy: 'Create your account in just 2 minutes.',
  },
  {
    title: 'Add Products',
    copy: 'Enter your product catalog and pricing.',
  },
  {
    title: 'Start Tracking',
    copy: 'Monitor sales, inventory, and profits instantly.',
  },
]

const benefits = [
  {
    title: 'Save Time',
    copy: 'Reduce product management time by over 60%.',
  },
  {
    title: 'Increase Profit',
    copy: 'Cut spoilage losses and pricing inconsistencies.',
  },
  {
    title: 'Safe & Simple',
    copy: 'Your data stays secure and the app is easy to use.',
  },
]

const testimonials = [
  {
    quote:
      'Fruit Vendor has helped me reduce spoilage losses by 40%. I now know which products are selling fast and reorder on time.',
    name: 'Amina Hassan',
    role: 'Vegetable Shop Owner',
  },
  {
    quote:
      'I love how it simplifies sales recording. My customers pay via M-Pesa and everything is recorded automatically.',
    name: 'John Kamau',
    role: 'Hardware Merchant',
  },
  {
    quote:
      "Spoilage alerts have been a game changer. I get notifications 2 days before perishables expire and it saves us money.",
    name: 'Grace Mwangi',
    role: 'Pharmacy Owner',
  },
]

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#cta' },
      { label: 'Demo', href: '#hero' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#benefits' },
      { label: 'Blog', href: '#benefits' },
      { label: 'Careers', href: '#cta' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#how-it-works' },
      { label: 'Contact Us', href: '#cta' },
      { label: 'Privacy Policy', href: '#footer' },
    ],
  },
]

const CheckIcon = () => (
  <svg className={styles.checkIcon} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M7.8 14.6L3 9.9l1.4-1.4 3.2 3 7-7.1L16 5.6z" />
  </svg>
)

const StarIcon = () => (
  <svg className={styles.starIcon} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1.8l2.3 4.8 5.3.5-4 3.4 1.3 5.2L10 12.8l-4.9 2.9 1.3-5.2-4-3.4 5.3-.5z" />
  </svg>
)

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, onboardingStatus, signIn, signUp, markOnboardingStatus } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null)

  const goToDashboard = () => {
    if (!isAuthenticated) {
      setShowAuthModal('login')
    } else {
      navigate('/dashboard')
    }
  }

  const goToOnboarding = () => {
    if (!isAuthenticated) {
      setShowAuthModal('register')
    } else {
      if (onboardingStatus !== 'pending') {
        markOnboardingStatus('pending')
      }
      navigate('/onboarding')
    }
  }

  const handleAuthSubmit = async (data: LoginCredentials | VendorCreate) => {
    if (showAuthModal === 'login') {
      const status = await signIn(data as LoginCredentials)
      if (status === 'completed') {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } else if (showAuthModal === 'register') {
      await signUp(data as VendorCreate)
      navigate('/onboarding')
    }
  }

  return (
    <>
      <div className={styles.page}>
      <header className={styles.header} id="hero">
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            FV
          </span>
          <div>
            <strong>Fruit Vendor</strong>
            <p>Business app built for Africa</p>
          </div>
        </div>
        {!isAuthenticated ? (
          <div className={styles.headerButtons}>
            <button type="button" className={styles.signInButton} onClick={() => setShowAuthModal('login')}>
              Sign In
            </button>
            <button type="button" className={styles.joinButton} onClick={goToOnboarding}>
              Join Now
            </button>
          </div>
        ) : (
          <button type="button" className={styles.joinButton} onClick={goToDashboard}>
            Go to Dashboard
          </button>
        )}
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>Small Business App</span>
            <h1>
              Manage Your Business with <span className={styles.highlightYellow}>Ease</span> and{' '}
              <span className={styles.highlightBlue}>Efficiency</span>
            </h1>
            <p>
              The first app built for African small business owners. Track inventory, record sales, and reduce spoilage
              losses in one place.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={goToOnboarding}>
                {isAuthenticated ? 'Resume Setup' : 'Start Free'}
              </button>
              <button type="button" className={styles.secondaryAction} onClick={goToDashboard}>
                {isAuthenticated ? 'Go to Dashboard' : 'View Demo'}
              </button>
            </div>
            {!isAuthenticated && (
              <p className={styles.signInPrompt}>
                Already have an account?{' '}
                <button type="button" onClick={() => setShowAuthModal('login')} className={styles.signInLink}>
                  Sign in
                </button>
              </p>
            )}
            <div className={styles.heroBenefits}>
              <div>
                <CheckIcon />
                <span>No Credit Card</span>
              </div>
              <div>
                <CheckIcon />
                <span>14 Days Free</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src="/images/1st.png" alt="Fruit vendor storefront" />
          </div>
        </section>

        <section className={styles.metrics}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className={styles.features} id="features">
          <div className={styles.sectionIntro}>
            <h2>Everything You Need</h2>
            <p>An app with all the features to manage your business more efficiently.</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.howItWorks} id="how-it-works">
          <div className={styles.sectionIntro}>
            <h2>How It Works</h2>
            <p>Get started with the app in 3 simple steps.</p>
          </div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.benefitsSection} id="benefits">
          <div className={styles.benefitsImage}>
            <img src="/images/2nd.png" alt="Small business owner working" />
          </div>
          <div className={styles.benefitsCopy}>
            <h2>Why Business Owners Love Fruit Vendor?</h2>
            <p>We built an app that understands the needs of African small businesses.</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit.title}>
                  <CheckIcon />
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.testimonials} id="testimonials">
          <div className={styles.sectionIntro}>
            <h2>What Our Customers Say</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.stars}>
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <span className={styles.testimonialName}>{testimonial.name}</span>
                  <span className={styles.testimonialRole}>{testimonial.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.cta} id="cta">
          <div>
            <h2>Ready to Start Growing Your Business?</h2>
            <p>Join hundreds of business owners using Fruit Vendor every day.</p>
          </div>
          <div className={styles.ctaActions}>
            <button type="button" className={styles.ctaPrimary} onClick={goToOnboarding}>
              {isAuthenticated ? 'Resume Setup' : 'Start Free Now'}
            </button>
            <button type="button" className={styles.ctaSecondary} onClick={goToDashboard}>
              {isAuthenticated ? 'Go to Dashboard' : 'Request Demo'}
            </button>
          </div>
          <p className={styles.ctaNote}>No credit card required · 14 days free · No signup fees</p>
        </section>
      </main>

      <footer className={styles.footer} id="footer">
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.logoMark} aria-hidden="true">
              FV
            </span>
            <div>
              <strong>Fruit Vendor</strong>
              <p>Business management app built for Africa.</p>
            </div>
          </div>
          <div className={styles.footerColumns}>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} Fruit Vendor. All rights reserved.</span>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal
          mode={showAuthModal}
          onClose={() => setShowAuthModal(null)}
          onSubmit={handleAuthSubmit}
        />
      )}
    </div>
    </>
  )
}

export default LandingPage
