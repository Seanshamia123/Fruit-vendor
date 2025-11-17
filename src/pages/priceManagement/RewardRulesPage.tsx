import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import MainLayout from '../../layouts/MainLayout'
import SectionTabs from '../../components/priceManagement/SectionTabs'
import styles from './RewardRules.module.css'
import { rewardTips } from './data'
import { usePriceManagement } from '../../hooks/usePriceManagement'

type RewardRulesViewProps = {
  editing?: boolean
}

type RuleFormData = {
  rule_name: string
  condition_type: string
  condition_value: string
  bonus_type: string
  bonus_value: string
}

const RewardRulesView = ({ editing = false }: RewardRulesViewProps) => {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const {
    isLoading,
    error,
    rewardRules,
    bonusRules,
    rewardSummaryMetrics,
    handleToggleBonusRule,
    handleDeleteBonusRule,
    handleCreateBonusRule,
    handleUpdateBonusRule,
  } = usePriceManagement()

  const [formData, setFormData] = useState<RuleFormData>({
    rule_name: '',
    condition_type: 'sales_value',
    condition_value: '',
    bonus_type: 'percentage',
    bonus_value: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editingRuleId = params.id ? Number(params.id) : null
  const editingRule = editingRuleId ? bonusRules.find((r) => r.id === editingRuleId) : null

  // Load rule data when editing
  useEffect(() => {
    if (editing && editingRule) {
      setFormData({
        rule_name: editingRule.rule_name,
        condition_type: editingRule.condition_type,
        condition_value: editingRule.condition_value.toString(),
        bonus_type: editingRule.bonus_type,
        bonus_value: editingRule.bonus_value.toString(),
      })
    } else if (editing && !editingRuleId) {
      // Creating new rule - reset form
      setFormData({
        rule_name: '',
        condition_type: 'sales_value',
        condition_value: '',
        bonus_type: 'percentage',
        bonus_value: '',
      })
    }
  }, [editing, editingRule, editingRuleId])

  const hasRules = rewardRules.length > 0

  const triggerOptions = [
    { value: 'sales_value', label: 'Sales amount reached', hint: 'Example: Spend over KSh 1,000' },
    { value: 'quantity', label: 'Quantity purchased', hint: 'Example: Buy 10 tomatoes' },
    { value: 'visit_frequency', label: 'Number of visits', hint: 'Example: 3 visits this week' },
  ]

  const rewardOptions = [
    { value: 'percentage', label: 'Percentage discount', hint: 'Great for basket boosters' },
    { value: 'fixed', label: 'Fixed discount', hint: 'Ideal for staple items' },
    { value: 'free_item', label: 'Free product', hint: 'Drive repeat purchases' },
  ]

  const handleSave = async () => {
    setSaveError(null)

    // Validation
    if (!formData.rule_name.trim()) {
      setSaveError('Please enter a rule name')
      return
    }

    const conditionValue = parseFloat(formData.condition_value)
    if (isNaN(conditionValue) || conditionValue <= 0) {
      setSaveError('Please enter a valid condition value')
      return
    }

    const bonusValue = parseFloat(formData.bonus_value)
    if (isNaN(bonusValue) || bonusValue <= 0) {
      setSaveError('Please enter a valid reward value')
      return
    }

    if (formData.bonus_type === 'percentage' && bonusValue > 100) {
      setSaveError('Percentage discount cannot exceed 100%')
      return
    }

    setIsSaving(true)
    try {
      const data = {
        rule_name: formData.rule_name.trim(),
        condition_type: formData.condition_type,
        condition_value: conditionValue,
        bonus_type: formData.bonus_type,
        bonus_value: bonusValue,
        is_active: true,
      }

      if (editingRuleId) {
        await handleUpdateBonusRule(editingRuleId, data)
      } else {
        await handleCreateBonusRule(data)
      }

      navigate('/price-management/rewards')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save rule')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicate = async (rule: typeof bonusRules[0]) => {
    try {
      await handleCreateBonusRule({
        rule_name: `${rule.rule_name} (Copy)`,
        condition_type: rule.condition_type,
        condition_value: rule.condition_value,
        bonus_type: rule.bonus_type,
        bonus_value: rule.bonus_value,
        is_active: false,
      })
    } catch (err) {
      console.error('Failed to duplicate rule:', err)
    }
  }

  const showEditorPlaceholder = editing && !editingRuleId && hasRules

  if (isLoading) {
    return (
      <MainLayout
        title="Reward Rules"
        subtitle="Create and manage automated rewards"
      >
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reward rules...</div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout
        title="Reward Rules"
        subtitle="Create and manage automated rewards"
      >
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          Error loading reward rules: {error}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      title="Reward Rules"
      subtitle={editing ? 'Update how rewards trigger for your customers' : 'Create and manage automated rewards'}
      trailing={
        <div className={styles.actionsRow}>
          <span className={styles.countBadge}>{rewardRules.length} saved rules</span>
          {editing ? (
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/price-management/rewards')}>
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/price-management/rewards/new')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New rule
          </button>
        </div>
      }
    >
      <div className={styles.pageShell}>
        <div className={styles.tabRow}>
          <SectionTabs />
        </div>
        <section className={styles.metricsGrid}>
          {rewardSummaryMetrics.map((metric) => (
            <article key={metric.id} className={styles.metricCard}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricDescription}>{metric.description}</span>
            </article>
          ))}
        </section>

        {editing ? (
          <section className={styles.editorCard}>
            {showEditorPlaceholder ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No rule selected</div>
                <p className={styles.emptySubtitle}>
                  Please select a rule to edit or create a new one.
                </p>
                <div className={styles.emptyActions}>
                  <Button variant="primary" onClick={() => navigate('/price-management/rewards')}>
                    Back to reward list
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <header className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    {editingRuleId ? 'Edit reward rule' : 'Create new reward rule'}
                  </h2>
                  <p className={styles.sectionSubtitle}>
                    {editingRuleId
                      ? 'Adjust the trigger and reward before saving'
                      : 'Set up a new reward rule for your customers'}
                  </p>
                </header>
                {saveError && (
                  <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee', color: '#c00', borderRadius: '4px' }}>
                    {saveError}
                  </div>
                )}
                <p className={styles.editorIntro}>
                  {editingRuleId
                    ? `You're editing ${formData.rule_name || 'this rule'}. Update the trigger and reward structure, then save the rule to apply changes instantly.`
                    : 'Create a new reward rule by defining when it triggers and what reward customers receive.'}
                </p>
                <div className={styles.editorGrid}>
                  <label className={styles.inputGroup}>
                    <span className={styles.inputLabel}>Rule name</span>
                    <input
                      className={styles.inputField}
                      value={formData.rule_name}
                      onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                      placeholder="e.g., Spend KSh 1000 get 10% off"
                    />
                  </label>
                  <div className={styles.radioGroup}>
                    <span className={styles.radioLabel}>Trigger condition</span>
                    <div className={styles.radioOptions}>
                      {triggerOptions.map((option) => (
                        <label key={option.value} className={styles.radioOption}>
                          <input
                            type="radio"
                            name="trigger"
                            value={option.value}
                            checked={formData.condition_type === option.value}
                            onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })}
                          />
                          <span>
                            <strong>{option.label}</strong>
                            <br />
                            <small>{option.hint}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className={styles.inputGroup}>
                    <span className={styles.inputLabel}>
                      {formData.condition_type === 'sales_value' ? 'Minimum amount (KSh)' :
                       formData.condition_type === 'quantity' ? 'Quantity required' :
                       'Number of visits'}
                    </span>
                    <input
                      className={styles.inputField}
                      type="number"
                      value={formData.condition_value}
                      onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                      placeholder="e.g., 1000"
                    />
                  </label>
                  <div className={styles.radioGroup}>
                    <span className={styles.radioLabel}>Reward type</span>
                    <div className={styles.radioOptions}>
                      {rewardOptions.map((option) => (
                        <label key={option.value} className={styles.radioOption}>
                          <input
                            type="radio"
                            name="reward"
                            value={option.value}
                            checked={formData.bonus_type === option.value}
                            onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value })}
                          />
                          <span>
                            <strong>{option.label}</strong>
                            <br />
                            <small>{option.hint}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className={styles.inputGroup}>
                    <span className={styles.inputLabel}>
                      {formData.bonus_type === 'percentage' ? 'Discount percentage (%)' :
                       formData.bonus_type === 'fixed' ? 'Discount amount (KSh)' :
                       'Free item quantity'}
                    </span>
                    <input
                      className={styles.inputField}
                      type="number"
                      value={formData.bonus_value}
                      onChange={(e) => setFormData({ ...formData, bonus_value: e.target.value })}
                      placeholder={formData.bonus_type === 'percentage' ? 'e.g., 10' : 'e.g., 100'}
                    />
                  </label>
                </div>
                <div className={styles.editorActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => navigate('/price-management/rewards')}>
                    Discard changes
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save rule'}
                  </button>
                </div>
              </>
            )}
          </section>
        ) : null}

        <section className={styles.ruleListCard}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Current reward rules</h2>
            <p className={styles.sectionSubtitle}>Enable or pause rules as your promotions change</p>
          </header>
          {hasRules ? (
            <div className={styles.ruleList}>
              {rewardRules.map((rule) => {
                const backendRule = bonusRules.find((r) => r.id.toString() === rule.id)
                return (
                  <article
                    key={rule.id}
                    className={`${styles.ruleCard} ${rule.status === 'inactive' ? styles.ruleInactive : ''}`}
                  >
                    <div>
                      <div className={styles.ruleHeader}>
                        <div>
                          <h3 className={styles.ruleTitle}>{rule.name}</h3>
                          <div className={styles.ruleIndicators}>
                            <span className={`${styles.ruleIndicator} ${rule.status === 'active' ? styles.ruleIndicatorSuccess : styles.ruleIndicatorPaused}`}>
                              {rule.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                            <span className={styles.ruleIndicator}>{rule.iconLabel}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.ruleDetails}>
                        <div className={styles.detailRow}>
                          <div className={styles.detailColumn}>
                            <span className={styles.detailLabel}>Condition</span>
                            <span className={styles.detailValue}>{rule.condition}</span>
                          </div>
                          <div className={styles.detailColumn}>
                            <span className={styles.detailLabel}>Reward</span>
                            <span className={styles.detailValue}>{rule.reward}</span>
                          </div>
                        </div>
                        <span className={styles.ruleFooter}>
                          Created {rule.createdOn} · Applied {rule.appliedCount} times
                        </span>
                      </div>
                    </div>
                    <div className={styles.ruleActions}>
                      <button
                        type="button"
                        className={`${styles.toggleButton} ${rule.status === 'inactive' ? styles.toggleButtonInactive : ''}`}
                        onClick={async () => {
                          try {
                            await handleToggleBonusRule(Number(rule.id), rule.status === 'inactive')
                          } catch (err) {
                            console.error('Failed to toggle rule:', err)
                          }
                        }}
                      >
                        {rule.status === 'active' ? 'Turn off' : 'Turn on'}
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => navigate(`/price-management/rewards/edit/${rule.id}`)}
                        aria-label="Edit rule"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label="Duplicate rule"
                        onClick={async () => {
                          if (backendRule) {
                            await handleDuplicate(backendRule)
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                          <rect x="8" y="8" width="12" height="12" rx="2" />
                          <path d="M4 16V6a2 2 0 0 1 2-2h10" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label="Delete rule"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
                            try {
                              await handleDeleteBonusRule(Number(rule.id))
                            } catch (err) {
                              console.error('Failed to delete rule:', err)
                            }
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No reward rules yet</div>
              <p className={styles.emptySubtitle}>
                Create your first reward to surprise loyal customers. You can set conditions such as spend amounts or
                item counts.
              </p>
              <div className={styles.emptyActions}>
                <Button variant="primary" onClick={() => navigate('/price-management/rewards/new')}>
                  Create a rule
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className={styles.tipCard}>
          <header className={styles.tipHeader}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
              <path d="M12 6v6l3 2" />
              <path d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0" />
            </svg>
            Usage tips
          </header>
          <div className={styles.tipList}>
            {rewardTips.map((tip) => (
              <div key={tip.id}>
                <div className={styles.tipItemTitle}>{tip.title}</div>
                <p className={styles.tipItemDescription}>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

const RewardRulesPage = () => <RewardRulesView />

export const RewardRuleEditorPage = () => <RewardRulesView editing />

export default RewardRulesPage
