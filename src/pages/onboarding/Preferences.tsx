import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import StepperFooter from '../../components/StepperFooter'
import Button from '../../components/Button'
import Select from '../../components/Select'
import SettingRow from '../../components/SettingRow'
import { useOnboarding } from '../../state/onboardingContext'
import { useAuth } from '../../state/authContext'
import { saveOnboarding } from '../../utils/storage'
import styles from './Preferences.module.css'

const Preferences: React.FC = () => {
  const navigate = useNavigate()
  const { preferences, setPreference, selectedKpis } = useOnboarding()
  const { markOnboardingStatus, signOut } = useAuth()

  const [saving, setSaving] = useState(false)

  const finish = () => {
    setSaving(true)
    // Persist to localStorage (offline-first)
    const status = 'completed' as const
    saveOnboarding({
      selectedKpis,
      preferences,
      status,
      updatedAt: new Date().toISOString(),
    })
    markOnboardingStatus(status)
    // simulate API/network delay to show feedback
    setTimeout(() => {
      signOut()
      navigate('/sign-in', { replace: true })
    }, 200)
  }

  const skip = () => {
    const status = 'skipped' as const
    saveOnboarding({
      selectedKpis,
      preferences,
      status,
      updatedAt: new Date().toISOString(),
    })
    markOnboardingStatus(status)
    signOut()
    navigate('/sign-in', { replace: true })
  }

  const editLater = () => {
    const status = 'deferred' as const
    saveOnboarding({
      selectedKpis,
      preferences,
      status,
      updatedAt: new Date().toISOString(),
    })
    markOnboardingStatus(status)
    signOut()
    navigate('/sign-in', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <TopBar />

        <main className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>How do you want to view them?</h1>
          </header>

          {selectedKpis.length === 0 && (
            <div className={styles.alertBox} role="alert" aria-live="assertive">
              You have not selected any metrics yet. Choose at least one metric first to tailor your preferences.
            </div>
          )}

          <div className={styles.grid}>
            <SettingRow label="Time frame">
              <Select
                aria-label="Time frame"
                value={preferences.timeframe}
                onChange={(e) => setPreference('timeframe', e.currentTarget.value as typeof preferences.timeframe)}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </Select>
            </SettingRow>

            <SettingRow label="Display type">
              <Select
                aria-label="Display type"
                value={preferences.displayType}
                onChange={(e) => setPreference('displayType', e.currentTarget.value as typeof preferences.displayType)}
              >
                <option>Chart</option>
                <option>Table</option>
                <option>Cards</option>
              </Select>
            </SettingRow>

            <SettingRow label="Notifications">
              <Select
                aria-label="Notifications"
                value={preferences.notifications}
                onChange={(e) => setPreference('notifications', e.currentTarget.value as typeof preferences.notifications)}
              >
                <option>Never</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </Select>
            </SettingRow>

            <SettingRow label="Granularity">
              <Select
                aria-label="Granularity"
                value={preferences.granularity}
                onChange={(e) => setPreference('granularity', e.currentTarget.value as typeof preferences.granularity)}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </Select>
            </SettingRow>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={skip}>Skip</Button>
            <Button variant="secondary" onClick={editLater}>Edit later</Button>
            <Button onClick={finish} disabled={saving || selectedKpis.length === 0}>
              {saving ? 'Saving…' : 'Finish'}
            </Button>
          </div>
        </main>

        <footer className={styles.footer}>
          <StepperFooter step={2} total={2} />
        </footer>
      </div>
    </div>
  )
}

export default Preferences
