import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SalesPage from './pages/Sales'
import OnboardingWizard from './pages/onboarding/OnboardingWizard'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import SpoilageCheck from './pages/spoilageCheck/SpoilageCheck'
import InventoryPage from './pages/inventory/InventoryPage'
import LandingPage from './pages/landing/LandingPage'
import Settings from './pages/Settings'
import {
  PriceManagementOverview,
  PricingStrategies,
  RewardRuleEditorPage,
  RewardRulesPage,
} from './pages/priceManagement'
import { OnboardingProvider } from './state/onboarding'
import { AuthProvider } from './state/auth'
import { useAuth } from './state/authContext'
import type { ReactElement, ReactNode } from 'react'

type GuardProps = {
  children: ReactElement
}

const RequireAuth = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}

const RequireOnboardingComplete = ({ children }: GuardProps) => {
  const { onboardingStatus } = useAuth()

  if (onboardingStatus === 'pending') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

const RouteShell = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <OnboardingProvider>{children}</OnboardingProvider>
  </AuthProvider>
)

const App = () => {
  return (
    <RouteShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingWizard />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <Dashboard />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/sales"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <SalesPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/inventory"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <InventoryPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <AnalyticsPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/spoilage-check"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <SpoilageCheck />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/price-management"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <PriceManagementOverview />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/price-management/strategies"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <PricingStrategies />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/price-management/rewards"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <RewardRulesPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/price-management/rewards/new"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <RewardRuleEditorPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/price-management/rewards/edit/:id"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <RewardRuleEditorPage />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <Settings />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteShell>
  )
}

export default App
