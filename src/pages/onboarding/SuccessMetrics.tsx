import React from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import StepperFooter from '../../components/StepperFooter'
import Chip from '../../components/Chip'
import Button from '../../components/Button'
import { KPI_OPTIONS, useOnboarding } from '../../state/onboardingContext'
import { useDevice } from '../../hooks/useDevice'
import styles from './SuccessMetrics.module.css'

const SuccessMetrics: React.FC = () => {
  const navigate = useNavigate()
  const { selectedKpis, toggleKpi } = useOnboarding()
  const device = useDevice()

  const canContinue = selectedKpis.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <TopBar />

        <main className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>What do you view as success in your business?</h1>
            <p className={styles.subtitle}>Pick all that apply</p>
          </header>

          <section
            className={`${styles.grid} ${
              device === 'mobile' ? styles.gridMobile : device === 'tablet' ? styles.gridTablet : styles.gridDesktop
            }`}
          >
            {KPI_OPTIONS.map((kpi) => (
              <Chip key={kpi} label={kpi} selected={selectedKpis.includes(kpi)} onClick={() => toggleKpi(kpi)} />
            ))}
          </section>

          {selectedKpis.length === 0 && (
            <p className={styles.notice} aria-live="polite">
              Pick at least one metric to continue.
            </p>
          )}

          <div className={styles.nextButtonWrapper}>
            <Button onClick={() => navigate('/onboarding/preferences')} disabled={!canContinue} aria-disabled={!canContinue}>
              Next
            </Button>
          </div>
        </main>

        <footer className={styles.footer}>
          <StepperFooter step={1} total={2} />
        </footer>
      </div>
    </div>
  )
}

export default SuccessMetrics
