import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MainLayout from '../../layouts/MainLayout'
import SectionTabs from '../../components/priceManagement/SectionTabs'
import styles from './RewardRules.module.css'
import {
  rewardRules,
  rewardSummaryMetrics,
  rewardTips,
} from './data'

type RewardRulesViewProps = {
  editing?: boolean
}

const RewardRulesView = ({ editing = false }: RewardRulesViewProps) => {
  const navigate = useNavigate()
  const hasRules = rewardRules.length > 0
  const editingRule = rewardRules.find((rule) => rule.status === 'active') ?? rewardRules[0] ?? null

  const triggerOptions = [
    { value: 'sales-value', label: 'Sales amount reached', hint: 'Example: Spend over KSh 1,000' },
    { value: 'quantity', label: 'Quantity purchased', hint: 'Example: Buy 10 tomatoes' },
    { value: 'visit-frequency', label: 'Number of visits', hint: 'Example: 3 visits this week' },
  ]

  const rewardOptions = [
    { value: 'percentage-discount', label: 'Percentage discount', hint: 'Great for basket boosters' },
    { value: 'fixed-discount', label: 'Fixed discount', hint: 'Ideal for staple items' },
    { value: 'free-item', label: 'Free product', hint: 'Drive repeat purchases' },
  ]

  const showEditorPlaceholder = editing && !editingRule

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
            onClick={() => navigate('/price-management/rewards/edit')}
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
                <div className={styles.emptyTitle}>No rule to edit</div>
                <p className={styles.emptySubtitle}>
                  Create a reward rule first, then you can customise triggers and rewards here.
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
                  <h2 className={styles.sectionTitle}>Edit reward rule</h2>
                  <p className={styles.sectionSubtitle}>Adjust the trigger and reward before saving</p>
                </header>
                <p className={styles.editorIntro}>
                  You&apos;re editing <strong>{editingRule?.name}</strong>. Update the trigger and reward structure, then save
                  the rule to apply changes instantly to the sales flow.
                </p>
                <div className={styles.editorGrid}>
                  <label className={styles.inputGroup}>
                    <span className={styles.inputLabel}>Rule name</span>
                    <input className={styles.inputField} defaultValue={editingRule?.name ?? ''} />
                  </label>
                  <div className={styles.radioGroup}>
                    <span className={styles.radioLabel}>Trigger condition</span>
                    <div className={styles.radioOptions}>
                      {triggerOptions.map((option) => (
                        <label key={option.value} className={styles.radioOption}>
                          <input type="radio" name="trigger" value={option.value} defaultChecked={option.value === 'sales-value'} />
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
                    <span className={styles.inputLabel}>Target amount</span>
                    <input className={styles.inputField} defaultValue="KSh 1,000" />
                  </label>
                  <div className={styles.radioGroup}>
                    <span className={styles.radioLabel}>Reward type</span>
                    <div className={styles.radioOptions}>
                      {rewardOptions.map((option) => (
                        <label key={option.value} className={styles.radioOption}>
                          <input type="radio" name="reward" value={option.value} defaultChecked={option.value === 'percentage-discount'} />
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
                    <span className={styles.inputLabel}>Reward value</span>
                    <input className={styles.inputField} defaultValue="10%" />
                  </label>
                </div>
                <div className={styles.editorActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => navigate('/price-management/rewards')}>
                    Discard changes
                  </button>
                  <button type="button" className={styles.primaryButton}>
                    Save rule
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
              {rewardRules.map((rule) => (
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
                  >
                    {rule.status === 'active' ? 'Turn off' : 'Turn on'}
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => navigate('/price-management/rewards/edit')}
                    aria-label="Edit rule"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} aria-label="Duplicate rule">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} aria-label="Delete rule">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No reward rules yet</div>
              <p className={styles.emptySubtitle}>
                Create your first reward to surprise loyal customers. You can set conditions such as spend amounts or
                item counts.
              </p>
              <div className={styles.emptyActions}>
                <Button variant="primary" onClick={() => navigate('/price-management/rewards/edit')}>
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
