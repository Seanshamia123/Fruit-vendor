import React from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import StepperFooter from '../../components/StepperFooter'
import Chip from '../../components/Chip'
import Button from '../../components/Button'
import { KPI_OPTIONS, useOnboarding } from '../../state/onboardingContext'
import { useDevice } from '../../hooks/useDevice'

const SuccessMetrics: React.FC = () => {
  const navigate = useNavigate()
  const { selectedKpis, toggleKpi } = useOnboarding()
  const device = useDevice()

  const canContinue = selectedKpis.length > 0

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto px-4 pt-2 pb-8 flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl">
        <TopBar />

        <main className="flex-1 animate-page">
          <header className="text-center mt-2 mb-6">
            <h1 className="text-lg font-semibold">What do you view as success in your business?</h1>
            <p className="text-sm text-gray-600 mt-1">Pick all that apply</p>
          </header>

          <section
            className={`grid gap-3 mb-6 ${
              device === 'mobile' ? 'grid-cols-3' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-6'
            }`}
          >
            {KPI_OPTIONS.map((kpi) => (
              <Chip
                key={kpi}
                label={kpi}
                selected={selectedKpis.includes(kpi)}
                onClick={() => toggleKpi(kpi)}
                className="h-16 sm:h-20 md:h-24"
              />
            ))}
          </section>

          {selectedKpis.length === 0 && (
            <p className="text-center text-sm text-gray-500 mb-4" aria-live="polite">
              Pick at least one metric to continue.
            </p>
          )}

          <div className="flex justify-end sticky bottom-4">
            <Button
              onClick={() => navigate('/onboarding/preferences')}
              disabled={!canContinue}
              aria-disabled={!canContinue}
              className={!canContinue ? 'opacity-60 cursor-not-allowed' : ''}
            >
              Next
            </Button>
          </div>
        </main>

        <footer className="mt-8">
          <StepperFooter step={1} total={2} />
        </footer>
      </div>
    </div>
  )
}

export default SuccessMetrics
