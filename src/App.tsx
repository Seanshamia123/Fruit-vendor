import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SuccessMetrics from './pages/onboarding/SuccessMetrics'
import Preferences from './pages/onboarding/Preferences'
import { OnboardingProvider } from './state/onboarding'

const App = () => {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding/metrics" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding/metrics" element={<SuccessMetrics />} />
        <Route path="/onboarding/preferences" element={<Preferences />} />
      </Routes>
    </OnboardingProvider>
  )
}

export default App
