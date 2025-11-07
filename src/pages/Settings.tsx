
import { useMemo, useRef, useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import SettingTabs, { type TabKey } from '../components/settings/SettingTabs'
import ProfilePanel, { type ProfileFormData } from '../components/settings/ProfilePanel'
import DisplayPanel, { type DisplayOptionKey } from '../components/settings/DisplayPanel'
import AlertsPanel, { type AlertSettingKey, type PricingSettingKey } from '../components/settings/AlertsPanel'
import QuickPromoPanel from '../components/settings/QuickPromoPanel'
import LoyaltyRulesPanel from '../components/settings/LoyaltyRulesPanel'
import PricingFooter from '../components/settings/PricingFooter'
import { useSettings } from '../hooks/useSettings'
import styles from './Settings.module.css'

const PRODUCT_OPTIONS = ['Tomatoes', 'Onions', 'Milk', 'Bananas', 'Carrots', 'Spinach', 'Potatoes', 'Apples']
const MAX_QUICK_SELECTION = 6

type LanguageCode = 'sw' | 'en'

type SettingsCopy = {
  headerTitle: string
  tabs: Record<TabKey, string>
  subtitles: Record<TabKey, string>
  profile: {
    title: string
    edit: string
    save: string
    cancel: string
    fields: { name: string; phone: string; businessType: string; language: string }
    languageOptions: Record<LanguageCode, string>
    businessPlaceholder: string
    description: string
  }
  display: {
    title: string
    subtitle: string
    options: { key: 'charts' | 'text' | 'table'; title: string; description: string }[]
  }
  alerts: {
    alertsTitle: string
    pricingTitle: string
    alertOptions: { id: AlertSettingKey; label: string; hint: string }[]
    pricingOptions: { id: PricingSettingKey; label: string; hint: string }[]
    sliderLabel: (value: number) => string
    sliderRange: { min: string; max: string }
  }
  quickPromo: {
    title: string
    subtitle: string
    selectedLabel: string
    emptyLabel: string
    hint: (selected: number, max: number) => string
  }
  loyalty: {
    title: string
    subtitle: string
    description: string
  }
  footer: {
    title: string
    description: string
    cancel: string
    save: string
  }
}

const COPY: Record<LanguageCode, SettingsCopy> = {
  sw: {
    headerTitle: 'Mipango ya Akaunti',
    tabs: { profile: 'Wasifu', display: 'Onyesho', alerts: 'Arifa', pricing: 'Mikato' },
    subtitles: {
      profile: 'Badilisha maelezo ya akaunti yako',
      display: 'Badilisha namna taarifa zinavyoonekana',
      alerts: 'Weka arifa na mipango ya bei',
      pricing: 'Simamia mikato na mauzo ya haraka',
    },
    profile: {
      title: 'Maelezo ya Msingi',
      description: 'Badilisha maelezo ya akaunti yako',
      edit: 'Hariri',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      fields: {
        name: 'Jina',
        phone: 'Nambari ya simu',
        businessType: 'Aina ya biashara',
        language: 'Lugha',
      },
      languageOptions: { sw: 'Kiswahili', en: 'Kiingereza' },
      businessPlaceholder: 'Sokoni - mboga na matunda',
    },
    display: {
      title: 'Mipangilio ya Onyesho',
      subtitle: 'Njia ya kuona taarifa',
      options: [
        { key: 'charts', title: 'Michoro na Grafu', description: 'Picha na michoro inayoonyesha mauzo' },
        { key: 'text', title: 'Maandishi Rahisi', description: 'Taarifa kwa maneno tu' },
        { key: 'table', title: 'Jedwali', description: 'Orodha na jedwali za taarifa' },
      ],
    },
    alerts: {
      alertsTitle: 'Mipango ya Arifa',
      pricingTitle: 'Mipango ya Bei',
      alertOptions: [
        { id: 'stock', label: 'Arifa za uhaba wa bidhaa', hint: 'Arifa wakati bidhaa zinapungua' },
        { id: 'summary', label: 'Muhtasari wa kila siku', hint: 'Ripoti ya mauzo ya siku' },
        { id: 'rewards', label: 'Arifa za sheria za zawadi', hint: 'Arifa wakati sheria za zawadi zinaanzishwa' },
        { id: 'spoilage', label: 'Arifa za kuharibika', hint: 'Arifa wakati bidhaa zinakaribika kuharibika' },
      ],
      pricingOptions: [
        { id: 'quickPricing', label: 'Haraka kubadilisha bei', hint: 'Washa vitufe vya haraka vya kubadilisha bei' },
        { id: 'autoSuggest', label: 'Pendekeza bei kiotomatiki', hint: 'Pendekeza bei kulingana na bei za sokoni' },
      ],
      sliderLabel: (value) => `Faida ya kawaida (%) - ${value}%`,
      sliderRange: { min: '10%', max: '50%' },
    },
    quickPromo: {
      title: 'Bidhaa za Mauzo ya Haraka',
      subtitle: 'Chagua bidhaa ambazo unauza sana ili ziwe kwenye mauzo ya haraka',
      selectedLabel: 'Bidhaa zilizochaguliwa',
      emptyLabel: 'Hakuna bidhaa zilizochaguliwa bado',
      hint: (selected, max) => `Bidhaa zilizochaguliwa ${selected}/${max}`,
    },
    loyalty: {
      title: 'Sheria za Zawadi',
      subtitle: 'Washa sheria za zawadi',
      description: 'Ruhusu wateja kupata zawadi kwa ununuzi wao',
    },
    footer: {
      title: 'Una mabadiliko ambayo hayajahifadhiwa',
      description: 'Bonyeza "Hifadhi" kuweka mabadiliko yako',
      cancel: 'Ghairi',
      save: 'Hifadhi',
    },
  },
  en: {
    headerTitle: 'Account Settings',
    tabs: { profile: 'Profile', display: 'Display', alerts: 'Alerts', pricing: 'Promotions' },
    subtitles: {
      profile: 'Update your account details',
      display: 'Choose how data is presented',
      alerts: 'Configure alerts and pricing rules',
      pricing: 'Manage quick sale bundles and rewards',
    },
    profile: {
      title: 'Basic Details',
      description: 'Update the primary details for your account',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      fields: {
        name: 'Name',
        phone: 'Phone number',
        businessType: 'Business type',
        language: 'Language',
      },
      languageOptions: { sw: 'Swahili', en: 'English' },
      businessPlaceholder: 'Market - fruits and vegetables',
    },
    display: {
      title: 'Display Preferences',
      subtitle: 'How would you like to view your data?',
      options: [
        { key: 'charts', title: 'Charts & Graphs', description: 'Visual insights that highlight sales' },
        { key: 'text', title: 'Simple Text', description: 'Key updates in plain text' },
        { key: 'table', title: 'Data Table', description: 'Structured rows and columns of info' },
      ],
    },
    alerts: {
      alertsTitle: 'Alert Preferences',
      pricingTitle: 'Pricing Rules',
      alertOptions: [
        { id: 'stock', label: 'Low stock alerts', hint: 'Notify me when stock is running out' },
        { id: 'summary', label: 'Daily summary', hint: 'Send a daily sales recap' },
        { id: 'rewards', label: 'Reward rule alerts', hint: 'Alert me when reward rules change' },
        { id: 'spoilage', label: 'Spoilage alerts', hint: 'Warn me when items may spoil soon' },
      ],
      pricingOptions: [
        { id: 'quickPricing', label: 'Quick price changes', hint: 'Enable quick buttons to adjust price' },
        { id: 'autoSuggest', label: 'Auto-suggest prices', hint: 'Suggest prices based on market trends' },
      ],
      sliderLabel: (value) => `Default margin (%) - ${value}%`,
      sliderRange: { min: '10%', max: '50%' },
    },
    quickPromo: {
      title: 'Quick Sale Products',
      subtitle: 'Pick the products you sell the most to promote quickly',
      selectedLabel: 'Selected products',
      emptyLabel: 'No products selected yet',
      hint: (selected, max) => `Selected products ${selected}/${max}`,
    },
    loyalty: {
      title: 'Reward Rules',
      subtitle: 'Enable customer reward tracking',
      description: 'Allow customers to earn rewards with their purchases',
    },
    footer: {
      title: 'You have unsaved changes',
      description: 'Press "Save" to apply your updates',
      cancel: 'Cancel',
      save: 'Save',
    },
  },
}

const Settings = () => {
  const {vendor, preferences, isLoading, error, updateVendor, updatePreferences} = useSettings()

  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [profile, setProfile] = useState<ProfileFormData>({
    name: '',
    phone: '',
    businessType: '',
    language: 'en',
  })
  const [profileEditing, setProfileEditing] = useState(false)
  const [displayMode, setDisplayMode] = useState<DisplayOptionKey>('charts')
  const [selectedQuickProducts, setSelectedQuickProducts] = useState<string[]>([])
  const [alertSettings, setAlertSettings] = useState<Record<AlertSettingKey, boolean>>({
    stock: true,
    summary: true,
    rewards: false,
    spoilage: true,
  })
  const [pricingMargin, setPricingMargin] = useState(25)
  const [pricingSettings, setPricingSettings] = useState<Record<PricingSettingKey, boolean>>({
    quickPricing: true,
    autoSuggest: false,
  })
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true)

  // Sync vendor and preferences data from API to local state
  useEffect(() => {
    if (vendor) {
      setProfile({
        name: vendor.name,
        phone: vendor.contact,
        businessType: vendor.location || '',
        language: (preferences?.language as LanguageCode) || 'en',
      })
    }
  }, [vendor, preferences])

  useEffect(() => {
    if (preferences) {
      setDisplayMode((preferences.display_mode as DisplayOptionKey) || 'charts')
      setSelectedQuickProducts(preferences.quick_sale_products || [])
      setAlertSettings({
        stock: preferences.alert_low_stock ?? true,
        summary: preferences.alert_daily_summary ?? true,
        rewards: preferences.alert_rewards ?? false,
        spoilage: preferences.alert_spoilage ?? true,
      })
      setPricingMargin(preferences.pricing_margin ?? 25)
      setPricingSettings({
        quickPricing: preferences.pricing_quick_pricing ?? true,
        autoSuggest: preferences.pricing_auto_suggest ?? false,
      })
      setLoyaltyEnabled(preferences.loyalty_enabled ?? true)
    }
  }, [preferences])

  const initialSnapshot = useRef(
    JSON.stringify({
      profile,
      displayMode,
      selectedQuickProducts,
      alertSettings,
      pricingMargin,
      pricingSettings,
      loyaltyEnabled,
    })
  )

  const currentCopy = COPY[profile.language]

  const hasChanges = useMemo(() => {
    const currentSnapshot = JSON.stringify({
      profile,
      displayMode,
      selectedQuickProducts,
      alertSettings,
      pricingMargin,
      pricingSettings,
      loyaltyEnabled,
    })
    return currentSnapshot !== initialSnapshot.current
  }, [profile, displayMode, selectedQuickProducts, alertSettings, pricingMargin, pricingSettings, loyaltyEnabled])

  const toggleQuickProduct = (product: string) => {
    setSelectedQuickProducts((prev) => {
      if (prev.includes(product)) {
        return prev.filter((item) => item !== product)
      }
      if (prev.length >= MAX_QUICK_SELECTION) {
        return prev
      }
      return [...prev, product]
    })
  }

  const toggleAlertSetting = (key: AlertSettingKey) => {
    setAlertSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const togglePricingSetting = (key: PricingSettingKey) => {
    setPricingSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveSnapshot = async () => {
    try {
      // Save vendor profile
      await updateVendor({
        name: profile.name,
        contact: profile.phone,
        location: profile.businessType,
      })

      // Save preferences
      await updatePreferences({
        display_mode: displayMode,
        language: profile.language,
        alert_low_stock: alertSettings.stock,
        alert_daily_summary: alertSettings.summary,
        alert_rewards: alertSettings.rewards,
        alert_spoilage: alertSettings.spoilage,
        pricing_margin: pricingMargin,
        pricing_quick_pricing: pricingSettings.quickPricing,
        pricing_auto_suggest: pricingSettings.autoSuggest,
        quick_sale_products: selectedQuickProducts,
        loyalty_enabled: loyaltyEnabled,
      })

      // Update initial snapshot after successful save
      initialSnapshot.current = JSON.stringify({
        profile,
        displayMode,
        selectedQuickProducts,
        alertSettings,
        pricingMargin,
        pricingSettings,
        loyaltyEnabled,
      })
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings. Please try again.')
    }
  }

  const handleCancelSnapshot = () => {
    const parsed = JSON.parse(initialSnapshot.current)
    setProfile(parsed.profile)
    setDisplayMode(parsed.displayMode)
    setSelectedQuickProducts(parsed.selectedQuickProducts)
    setAlertSettings(parsed.alertSettings)
    setPricingMargin(parsed.pricingMargin)
    setPricingSettings(parsed.pricingSettings)
    setLoyaltyEnabled(parsed.loyaltyEnabled)
    setProfileEditing(false)
  }

  const handleProfileFieldChange = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileSave = async () => {
    try {
      await updateVendor({
        name: profile.name,
        contact: profile.phone,
        location: profile.businessType,
      })
      await updatePreferences({
        language: profile.language,
      })
      initialSnapshot.current = JSON.stringify({
        profile,
        displayMode,
        selectedQuickProducts,
        alertSettings,
        pricingMargin,
        pricingSettings,
        loyaltyEnabled,
      })
      setProfileEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleProfileCancel = () => {
    const parsed = JSON.parse(initialSnapshot.current)
    setProfile(parsed.profile)
    setProfileEditing(false)
  }

  const handleFooterSave = () => {
    handleSaveSnapshot()
  }

  const subtitle = currentCopy.subtitles[activeTab]

  if (isLoading) {
    return (
      <MainLayout title="Settings" subtitle="Loading...">
        <div className={styles.wrapper}>
          <p>Loading settings...</p>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Settings" subtitle="Error">
        <div className={styles.wrapper}>
          <p style={{color: 'red'}}>Error: {error}</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={currentCopy.headerTitle} subtitle={subtitle}>
      <div className={styles.wrapper}>
        <SettingTabs labels={currentCopy.tabs} value={activeTab} onChange={setActiveTab} />

        {activeTab === 'profile' && (
          <ProfilePanel
            value={profile}
            copy={currentCopy.profile}
            isEditing={profileEditing}
            onEdit={() => setProfileEditing(true)}
            onCancel={handleProfileCancel}
            onSave={handleProfileSave}
            onChange={handleProfileFieldChange}
          />
        )}

        {activeTab === 'display' && (
          <DisplayPanel
            activeOption={displayMode}
            onSelect={setDisplayMode}
            copy={currentCopy.display}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel
            copy={currentCopy.alerts}
            alertSettings={alertSettings}
            pricingSettings={pricingSettings}
            pricingMargin={pricingMargin}
            onToggleAlert={toggleAlertSetting}
            onTogglePricing={togglePricingSetting}
            onMarginChange={setPricingMargin}
          />
        )}

        {activeTab === 'pricing' && (
          <>
            <QuickPromoPanel
              products={PRODUCT_OPTIONS}
              selected={selectedQuickProducts}
              maxSelection={MAX_QUICK_SELECTION}
              onToggle={toggleQuickProduct}
              copy={{
                title: currentCopy.quickPromo.title,
                subtitle: currentCopy.quickPromo.subtitle,
                selectedLabel: currentCopy.quickPromo.selectedLabel,
                emptyLabel: currentCopy.quickPromo.emptyLabel,
                hintText: currentCopy.quickPromo.hint(selectedQuickProducts.length, MAX_QUICK_SELECTION),
              }}
            />
            <LoyaltyRulesPanel
              enabled={loyaltyEnabled}
              onToggle={() => setLoyaltyEnabled((prev) => !prev)}
              copy={currentCopy.loyalty}
            />
            <PricingFooter
              dirty={hasChanges}
              copy={currentCopy.footer}
              onCancel={handleCancelSnapshot}
              onSave={handleFooterSave}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default Settings
