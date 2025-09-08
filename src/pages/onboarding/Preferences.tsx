import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import StepperFooter from '../../components/StepperFooter'
import Button from '../../components/Button'
import Select from '../../components/Select'
import SettingRow from '../../components/SettingRow'
import { useOnboarding } from '../../state/onboardingContext'
import { saveOnboarding } from '../../utils/storage'

const Preferences: React.FC = () => {
  const navigate = useNavigate()
  const { preferences, setPreference, selectedKpis } = useOnboarding()

  const [saving, setSaving] = useState(false)

  const finish = () => {
    setSaving(true)
    // Persist to localStorage (offline-first)
    saveOnboarding({
      selectedKpis,
      preferences,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    })
    // simulate API/network delay to show feedback
    setTimeout(() => {
      navigate('/dashboard')
    }, 200)
  }

  const skip = () => {
    saveOnboarding({
      selectedKpis,
      preferences,
      status: 'skipped',
      updatedAt: new Date().toISOString(),
    })
    navigate('/dashboard')
  }

  const editLater = () => {
    saveOnboarding({
      selectedKpis,
      preferences,
      status: 'deferred',
      updatedAt: new Date().toISOString(),
    })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto px-4 pt-2 pb-8 flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl">
        <TopBar />

        <main className="flex-1 animate-page">
          <header className="text-center mt-2 mb-6">
            <h1 className="text-lg font-semibold">How do you want to view them?</h1>
          </header>

          {selectedKpis.length === 0 && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-50 text-yellow-800 border border-yellow-200" role="alert" aria-live="assertive">
              You have not selected any metrics yet. Choose at least one metric first to tailor your preferences.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex flex-wrap gap-3 justify-end mt-6 sticky bottom-4">
            <Button variant="ghost" onClick={skip}>Skip</Button>
            <Button variant="secondary" onClick={editLater}>Edit later</Button>
            <Button onClick={finish} disabled={saving}>{saving ? 'Saving…' : 'Finish'}</Button>
          </div>
        </main>

        <footer className="mt-8">
          <StepperFooter step={2} total={2} />
        </footer>
      </div>
    </div>
  )
}

export default Preferences
