import { useMemo, useState } from 'react'
import styles from '../Inventory.module.css'
import type {
  InventoryCategory,
  PurchaseCandidate,
  PurchaseDraft,
  PurchaseLine,
  PurchaseTab,
  PurchaseUnit,
} from '../types'

type NewPurchaseProps = {
  onSave: (lines: PurchaseLine[]) => boolean | Promise<boolean>
  candidates: PurchaseCandidate[]
}

const tabLabels: Record<PurchaseTab, string> = {
  existing: 'Catalog Items',
  new: 'New Purchase',
}

const unitOptions: PurchaseUnit[] = ['kg', 'pieces', 'litres', 'units']
const categoryOptions: InventoryCategory[] = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Other']

const formatCurrency = (value: number) => `KSh ${value.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

const NewPurchase = ({ onSave, candidates }: NewPurchaseProps) => {
  const [activeTab, setActiveTab] = useState<PurchaseTab>('existing')
  const [selectedItems, setSelectedItems] = useState<Record<string, PurchaseCandidate>>({})
  const [drafts, setDrafts] = useState<Record<string, PurchaseDraft>>({})
  const [customLines, setCustomLines] = useState<Array<PurchaseLine & { tempId: string }>>([])
  const [newLineForm, setNewLineForm] = useState({
    name: '',
    category: categoryOptions[0],
    quantity: '1',
    unit: unitOptions[0],
    unitCost: '0',
  })
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const toggleItem = (item: PurchaseCandidate) => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = item
      }
      return next
    })

    setDrafts((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = {
          itemId: item.id,
          quantity: '1',
          unit: item.availableQuantity.includes('kg')
            ? 'kg'
            : item.availableQuantity.includes('litre')
            ? 'litres'
            : 'pieces',
          unitCost: item.lastPrice.replace(/[^0-9.]/g, '') || '0',
        }
      }
      return next
    })
  }

  const selections = useMemo(() => Object.values(selectedItems), [selectedItems])

  const handleDraftChange = (itemId: string, field: keyof PurchaseDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? { itemId, quantity: '1', unit: 'kg', unitCost: '0' }),
        [field]: value,
      },
    }))
  }

  const handleNewLineField = (field: keyof typeof newLineForm, value: string) => {
    setNewLineForm((prev) => ({ ...prev, [field]: value }))
  }

  const addCustomLine = () => {
    if (!newLineForm.name.trim()) {
      setFormError('Item name is required.')
      return
    }
    const quantityValue = Number(newLineForm.quantity)
    const costValue = Number(newLineForm.unitCost)
    if (!quantityValue || quantityValue <= 0) {
      setFormError('Enter a quantity greater than zero.')
      return
    }
    if (!costValue || costValue <= 0) {
      setFormError('Enter the purchase price per unit.')
      return
    }

    const newLine: PurchaseLine & { tempId: string } = {
      tempId: `temp-${Date.now()}`,
      name: newLineForm.name.trim(),
      category: newLineForm.category,
      quantity: newLineForm.quantity,
      unit: newLineForm.unit,
      unitCost: newLineForm.unitCost,
    }

    setCustomLines((prev) => [newLine, ...prev])
    setNewLineForm({ ...newLineForm, name: '', quantity: '1', unitCost: '0' })
    setFormError(null)
  }

  const removeCustomLine = (tempId: string) => {
    setCustomLines((prev) => prev.filter((line) => line.tempId !== tempId))
  }

  const summaryLines = useMemo(
    () => [
      ...selections.map((item) => ({ type: 'existing' as const, item, draft: drafts[item.id] })),
      ...customLines.map((line) => ({ type: 'custom' as const, line })),
    ],
    [selections, drafts, customLines]
  )

  const totalAmount = useMemo(
    () =>
      summaryLines.reduce((sum, entry) => {
        if (entry.type === 'existing') {
          const draft = entry.draft
          if (!draft) return sum
          const quantityValue = Number(draft.quantity)
          const unitCostValue = Number(draft.unitCost)
          if (!quantityValue || !unitCostValue) return sum
          return sum + quantityValue * unitCostValue
        }
        const quantityValue = Number(entry.line.quantity)
        const unitCostValue = Number(entry.line.unitCost)
        if (!quantityValue || !unitCostValue) return sum
        return sum + quantityValue * unitCostValue
      }, 0),
    [summaryLines]
  )

  const canSave = summaryLines.length > 0 && summaryLines.every((entry) => {
    if (entry.type === 'existing') {
      const draft = entry.draft
      if (!draft) return false
      const quantityValue = Number(draft.quantity)
      const costValue = Number(draft.unitCost)
      return quantityValue > 0 && costValue > 0
    }
    const quantityValue = Number(entry.line.quantity)
    const costValue = Number(entry.line.unitCost)
    return entry.line.name.trim().length > 0 && quantityValue > 0 && costValue > 0
  })

  const handleSavePurchase = async () => {
    if (!canSave || isSaving) {
      if (!canSave) {
        setFormError('Add at least one item with quantity and price to save the purchase.')
      }
      return
    }

    const payload: PurchaseLine[] = summaryLines.map((entry) => {
      if (entry.type === 'existing') {
        const draft = entry.draft!
        return {
          id: entry.item.id,
          name: entry.item.name,
          category: entry.item.category,
          quantity: draft.quantity,
          unit: draft.unit,
          unitCost: draft.unitCost,
        }
      }
      return {
        name: entry.line.name,
        category: entry.line.category,
        quantity: entry.line.quantity,
        unit: entry.line.unit,
        unitCost: entry.line.unitCost,
      }
    })

    setFormError(null)
    setFormMessage(null)
    setIsSaving(true)
    try {
      const success = await onSave(payload)
      if (success) {
        setSelectedItems({})
        setDrafts({})
        setCustomLines([])
        setFormMessage('Purchase saved! Inventory and records have been updated.')
      } else {
        setFormError('Failed to save purchase. Please try again.')
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save purchase. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const clearForm = () => {
    setSelectedItems({})
    setDrafts({})
    setCustomLines([])
    setFormError(null)
    setFormMessage(null)
  }

  return (
    <div className={styles.purchaseRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>New Purchase</h2>
          <p className={styles.pageSubtitle}>Add products to your stock ledger</p>
        </div>
        <span className={styles.badgeMuted}>{summaryLines.length} items</span>
      </header>

      <section className={styles.cardSurface}>
        <h3 className={styles.sectionTitle}>Select Items</h3>
        <div className={styles.segmentGroup}>
          {(['existing', 'new'] as PurchaseTab[]).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`${styles.segmentButton} ${activeTab === tab ? styles.segmentButtonActive : ''}`}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'existing' ? (
          <div className={styles.listStack}>
            {candidates.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No products available</p>
                <p className={styles.emptySubtitle}>Create products first to see them here.</p>
              </div>
            ) : (
              candidates.map((candidate) => {
                const isSelected = Boolean(selectedItems[candidate.id])
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    className={`${styles.productOption} ${isSelected ? styles.productOptionSelected : ''}`}
                    onClick={() => toggleItem(candidate)}
                  >
                    <div>
                      <p className={styles.productName}>{candidate.name}{candidate.variety ? ` (${candidate.variety})` : ''}</p>
                      <p className={styles.productMeta}>
                        {candidate.category} • Last price: {candidate.lastPrice}
                      </p>
                    </div>
                    <span className={styles.quantityBadge}>{candidate.availableQuantity}</span>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <div className={styles.newPurchaseForm}>
            <div className={styles.formGrid}>
              <label className={styles.inlineField}>
                <span>Item name</span>
                <input
                  type="text"
                  value={newLineForm.name}
                  onChange={(event) => handleNewLineField('name', event.target.value)}
                  placeholder="e.g. Kale"
                />
              </label>
              <label className={styles.inlineField}>
                <span>Category</span>
                <select value={newLineForm.category} onChange={(event) => handleNewLineField('category', event.target.value)}>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.inlineField}>
                <span>Quantity</span>
                <input
                  type="number"
                  min="0"
                  value={newLineForm.quantity}
                  onChange={(event) => handleNewLineField('quantity', event.target.value)}
                />
              </label>
              <label className={styles.inlineField}>
                <span>Unit</span>
                <select value={newLineForm.unit} onChange={(event) => handleNewLineField('unit', event.target.value)}>
                  {unitOptions.map((unitOption) => (
                    <option key={unitOption} value={unitOption}>
                      {unitOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.inlineField}>
                <span>Unit price (KSh)</span>
                <input
                  type="number"
                  min="0"
                  value={newLineForm.unitCost}
                  onChange={(event) => handleNewLineField('unitCost', event.target.value)}
                />
              </label>
            </div>
            <div className={styles.selectionActions}>
              <button type="button" className={styles.primaryAction} onClick={addCustomLine}>
                Add Line
              </button>
            </div>
            {formError && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{formError}</p>}
          </div>
        )}
      </section>

      <section className={styles.cardSurface}>
        <h3 className={styles.sectionTitle}>Your Purchase ({summaryLines.length} {summaryLines.length === 1 ? 'item' : 'items'})</h3>
        {summaryLines.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="13" width="30" height="22" rx="5" />
                <path d="M16 21h16" />
                <path d="M16 28h10" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>No items yet</p>
            <p className={styles.emptySubtitle}>Select products above or add a new purchase line.</p>
          </div>
        ) : (
          <div className={styles.selectionList}>
            {summaryLines.map((entry) => {
              if (entry.type === 'existing') {
                const draft = entry.draft
                const item = entry.item
                return (
                  <div key={item.id} className={styles.selectionRowDetailed}>
                    <div className={styles.selectionInfo}>
                      <p className={styles.productName}>{item.name}</p>
                      <p className={styles.productMeta}>{item.category} • Last price: {item.lastPrice}</p>
                    </div>
                    <div className={styles.selectionInputs}>
                      <label className={styles.inlineField}>
                        <span>Quantity</span>
                        <input
                          type="number"
                          min="0"
                          value={draft?.quantity ?? ''}
                          onChange={(event) => handleDraftChange(item.id, 'quantity', event.target.value)}
                        />
                      </label>
                      <label className={styles.inlineField}>
                        <span>Unit</span>
                        <select
                          value={draft?.unit ?? 'kg'}
                          onChange={(event) => handleDraftChange(item.id, 'unit', event.target.value)}
                        >
                          {unitOptions.map((unitOption) => (
                            <option key={unitOption} value={unitOption}>
                              {unitOption}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.inlineField}>
                        <span>Unit price (KSh)</span>
                        <input
                          type="number"
                          min="0"
                          value={draft?.unitCost ?? ''}
                          onChange={(event) => handleDraftChange(item.id, 'unitCost', event.target.value)}
                        />
                      </label>
                    </div>
                    <button type="button" className={styles.inlineRemove} onClick={() => toggleItem(item)}>
                      Remove
                    </button>
                  </div>
                )
              }

              return (
                <div key={entry.line.tempId} className={styles.selectionRowDetailed}>
                  <div className={styles.selectionInfo}>
                    <p className={styles.productName}>{entry.line.name}</p>
                    <p className={styles.productMeta}>{entry.line.category ?? 'Uncategorised'} • New purchase</p>
                  </div>
                  <div className={styles.selectionInputs}>
                    <label className={styles.inlineField}>
                      <span>Quantity</span>
                      <input
                        type="number"
                        min="0"
                        value={entry.line.quantity}
                        onChange={(event) =>
                          setCustomLines((prev) =>
                            prev.map((line) =>
                              line.tempId === entry.line.tempId ? { ...line, quantity: event.target.value } : line
                            )
                          )
                        }
                      />
                    </label>
                    <label className={styles.inlineField}>
                      <span>Unit</span>
                      <select
                        value={entry.line.unit}
                        onChange={(event) =>
                          setCustomLines((prev) =>
                            prev.map((line) =>
                              line.tempId === entry.line.tempId
                                ? { ...line, unit: event.target.value as PurchaseUnit }
                                : line
                            )
                          )
                        }
                      >
                        {unitOptions.map((unitOption) => (
                          <option key={unitOption} value={unitOption}>
                            {unitOption}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.inlineField}>
                      <span>Unit price (KSh)</span>
                      <input
                        type="number"
                        min="0"
                        value={entry.line.unitCost}
                        onChange={(event) =>
                          setCustomLines((prev) =>
                            prev.map((line) =>
                              line.tempId === entry.line.tempId ? { ...line, unitCost: event.target.value } : line
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                  <button type="button" className={styles.inlineRemove} onClick={() => removeCustomLine(entry.line.tempId)}>
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {summaryLines.length > 0 && (
          <div className={styles.selectionSummary}>
            <div>
              <span className={styles.metaMuted}>Purchase total</span>
              <p className={styles.summaryTotal}>{formatCurrency(totalAmount)}</p>
            </div>
            <div className={styles.selectionActions}>
              <button type="button" className={styles.secondaryButton} onClick={clearForm}>
                Clear
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => {
                  void handleSavePurchase()
                }}
                disabled={!canSave || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Purchase'}
              </button>
            </div>
          </div>
        )}

        {formMessage && <p className={`${styles.formMessage} ${styles.formMessageSuccess}`}>{formMessage}</p>}
        {formError && summaryLines.length === 0 && <p className={`${styles.formMessage} ${styles.formMessageError}`}>{formError}</p>}
      </section>
    </div>
  )
}

export default NewPurchase
