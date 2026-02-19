import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MainLayout from '../../layouts/MainLayout'
import { useSalesData } from '../../hooks/useSalesData'
import styles from './Sales.module.css'
import type {
  CartLine,
  CartRecord,
  CustomerSession,
  InventoryItem,
  PaymentFlow,
  PaymentMethod,
  PaymentSource,
} from './types'

type CartLineView = {
  id: string
  name: string
  quantity: number
  unit: InventoryItem['unit']
  unitPrice: number
  subtotal: number
  stock: number
}

type CartSummary = {
  lines: CartLineView[]
  total: number
  itemCount: number
}

type ManualDraft = {
  quantity: string
  unitPrice: string
}

type SaleLine = CartLineView & {
  stockBefore: number
  stockAfter: number
}

type SaleDetail = {
  id: string
  source: PaymentSource
  sessionId: string
  customerLabel: string
  method: PaymentMethod
  total: number
  timestamp: number
  attempt: number
  lines: SaleLine[]
  mpesaCode?: string
  phoneNumber?: string
}

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => `KSh ${currencyFormatter.format(value)}`

const formatInputNumber = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(2)

const formatQuantity = (quantity: number, unit: InventoryItem['unit']) => {
  const singular = unit === 'pieces' ? 'piece' : 'item'
  const plural = unit === 'pieces' ? 'pieces' : 'items'
  return `${quantity} ${quantity === 1 ? singular : plural}`
}

const formatStockLabel = (stock: number, unit: InventoryItem['unit']) => {
  const singular = unit === 'pieces' ? 'piece' : 'item'
  const plural = unit === 'pieces' ? 'pieces' : 'items'
  return `${stock} ${stock === 1 ? singular : plural}`
}

const relativeTimeFrom = (timestamp: number) => {
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(Math.round(diffMs / 60000), 0)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes === 1) return '1 minute ago'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  const diffHours = Math.round(diffMinutes / 60)
  return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
}

const generateTransactionId = () => `TXN-${Math.floor(100000 + Math.random() * 900000)}`

const generateMpesaCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 10; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return result
}

const normalizePhoneNumber = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''
  if (trimmed.startsWith('+')) {
    return `+${digits}`
  }
  if (digits.startsWith('0')) {
    return `+254${digits.slice(1)}`
  }
  if (digits.startsWith('254')) {
    return `+${digits}`
  }
  if (digits.startsWith('7')) {
    return `+254${digits}`
  }
  return `+${digits}`
}

const isLikelyValidMpesaNumber = (normalized: string) => /^\+2547\d{8}$/.test(normalized)

const buildCartSummary = (
  cart: CartRecord,
  inventoryMap: Map<string, InventoryItem>
): CartSummary => {
  const lines: CartLineView[] = []
  Object.values(cart).forEach((line) => {
    const item = inventoryMap.get(line.itemId)
    if (!item) return
    lines.push({
      id: line.itemId,
      name: item.name,
      quantity: line.quantity,
      unit: item.unit,
      unitPrice: line.unitPrice,
      subtotal: line.quantity * line.unitPrice,
      stock: item.stock,
    })
  })
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  return { lines, total, itemCount }
}

const countItemsSold = (lines: SaleLine[]) =>
  lines.reduce((total, line) => total + line.quantity, 0)

const SalesPage = () => {
  const navigate = useNavigate()
  const {
    inventoryItems,
    isLoading: isLoadingData,
    error: dataError,
    handleCompleteSale: backendCompleteSale,
    refetch: refetchData,
  } = useSalesData()
  const [inventory, setInventory] = useState(inventoryItems)
  const [activeTab, setActiveTab] = useState<'quick' | 'manual' | 'multi'>('quick')
  const [quickCart, setQuickCart] = useState<CartRecord>({})
  const [manualCart, setManualCart] = useState<CartRecord>({})
  const [manualDrafts, setManualDrafts] = useState<Record<string, ManualDraft>>({})
  const [manualEditingId, setManualEditingId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<CustomerSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow | null>(null)
  const [processingStep, setProcessingStep] = useState(1)
  const [processingSeconds, setProcessingSeconds] = useState(0)
  const [lastSale, setLastSale] = useState<SaleDetail | null>(null)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [mpesaPhoneError, setMpesaPhoneError] = useState<string | null>(null)
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({})
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})

  // Sync inventory when backend data loads
  useEffect(() => {
    if (inventoryItems.length > 0) {
      setInventory(inventoryItems)
    }
  }, [inventoryItems])

  const inventoryMap = useMemo(
    () => new Map(inventory.map((item) => [item.id, item])),
    [inventory]
  )

  const sessionsMap = useMemo(
    () => new Map(sessions.map((session) => [session.id, session])),
    [sessions]
  )

  const reservedTotals = useMemo(() => {
    const totals: Record<string, number> = {}

    const register = (record: CartRecord) => {
      Object.values(record).forEach((line) => {
        totals[line.itemId] = (totals[line.itemId] ?? 0) + line.quantity
      })
    }

    register(quickCart)
    register(manualCart)
    sessions.forEach((session) => register(session.items))

    return totals
  }, [quickCart, manualCart, sessions])

  const getRemainingStock = (itemId: string, exclude = 0) => {
    const item = inventoryMap.get(itemId)
    if (!item) return 0
    const reserved = reservedTotals[itemId] ?? 0
    const available = item.stock - (reserved - exclude)
    return available > 0 ? available : 0
  }

  const makeLineKey = (source: PaymentSource, sessionId: string, itemId: string) =>
    `${source}:${sessionId}:${itemId}`

  const getCartLine = (source: PaymentSource, sessionId: string, itemId: string): CartLine | null => {
    if (source === 'quick') return quickCart[itemId] ?? null
    if (source === 'manual') return manualCart[itemId] ?? null
    const session = sessionsMap.get(sessionId)
    return session?.items[itemId] ?? null
  }

  const clearLineDrafts = (key: string) => {
    setQuantityDrafts((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPriceDrafts((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const applyLineQuantityChange = (
    source: PaymentSource,
    sessionId: string,
    itemId: string,
    desiredQuantity: number
  ) => {
    const line = getCartLine(source, sessionId, itemId)
    if (!line) return 0

    const targetQuantity = Math.max(Math.floor(desiredQuantity), 0)
    const available = getRemainingStock(itemId, line.quantity)
    const nextQuantity = Math.min(targetQuantity, available)

    if (source === 'quick') {
      setQuickCart((prev) => {
        const current = prev[itemId]
        if (!current) return prev
        if (nextQuantity <= 0) {
          const updated = { ...prev }
          delete updated[itemId]
          return updated
        }
        return {
          ...prev,
          [itemId]: { ...current, quantity: nextQuantity },
        }
      })
    } else if (source === 'manual') {
      setManualCart((prev) => {
        const current = prev[itemId]
        if (!current) return prev
        if (nextQuantity <= 0) {
          const updated = { ...prev }
          delete updated[itemId]
          return updated
        }
        return {
          ...prev,
          [itemId]: { ...current, quantity: nextQuantity },
        }
      })
    } else {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session
          const current = session.items[itemId]
          if (!current) return session
          if (nextQuantity <= 0) {
            const updatedItems = { ...session.items }
            delete updatedItems[itemId]
            return { ...session, items: updatedItems }
          }
          return {
            ...session,
            items: { ...session.items, [itemId]: { ...current, quantity: nextQuantity } },
          }
        })
      )
    }

    return nextQuantity
  }

  const applyLinePriceChange = (
    source: PaymentSource,
    sessionId: string,
    itemId: string,
    desiredPrice: number
  ) => {
    const line = getCartLine(source, sessionId, itemId)
    if (!line) return 0

    const safePrice = Math.round(Math.max(desiredPrice, 0) * 100) / 100
    if (safePrice <= 0) return line.unitPrice

    if (source === 'quick') {
      setQuickCart((prev) => {
        const current = prev[itemId]
        if (!current) return prev
        return {
          ...prev,
          [itemId]: { ...current, unitPrice: safePrice },
        }
      })
    } else if (source === 'manual') {
      setManualCart((prev) => {
        const current = prev[itemId]
        if (!current) return prev
        return {
          ...prev,
          [itemId]: { ...current, unitPrice: safePrice },
        }
      })
    } else {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session
          const current = session.items[itemId]
          if (!current) return session
          return {
            ...session,
            items: { ...session.items, [itemId]: { ...current, unitPrice: safePrice } },
          }
        })
      )
    }

    return safePrice
  }

  const handleQuantityDraftChange = (key: string, value: string) => {
    setQuantityDrafts((prev) => ({ ...prev, [key]: value }))
  }

  const handlePriceDraftChange = (key: string, value: string) => {
    setPriceDrafts((prev) => ({ ...prev, [key]: value }))
  }

  const commitQuantityDraft = (
    source: PaymentSource,
    sessionId: string,
    itemId: string,
    key: string
  ) => {
    const rawValue = quantityDrafts[key]
    if (rawValue === undefined) return

    const trimmed = rawValue.trim()
    if (trimmed === '') {
      setQuantityDrafts((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }

    const parsed = Number(trimmed)
    if (Number.isNaN(parsed)) {
      clearLineDrafts(key)
      return
    }

    const applied = applyLineQuantityChange(source, sessionId, itemId, parsed)
    if (applied <= 0) {
      clearLineDrafts(key)
      return
    }

    setQuantityDrafts((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const commitPriceDraft = (
    source: PaymentSource,
    sessionId: string,
    itemId: string,
    key: string
  ) => {
    const rawValue = priceDrafts[key]
    if (rawValue === undefined) return

    const trimmed = rawValue.trim()
    if (trimmed === '') {
      setPriceDrafts((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }

    const parsed = Number(trimmed)
    if (Number.isNaN(parsed) || parsed <= 0) {
      setPriceDrafts((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }

    applyLinePriceChange(source, sessionId, itemId, parsed)

    setPriceDrafts((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleRemoveLine = (source: PaymentSource, sessionId: string, itemId: string) => {
    if (source === 'quick') handleQuickRemove(itemId)
    else if (source === 'manual') handleManualRemove(itemId)
    else handleSessionItemRemove(sessionId, itemId)
    const key = makeLineKey(source, sessionId, itemId)
    clearLineDrafts(key)
  }

  const quickSummary = useMemo(
    () => buildCartSummary(quickCart, inventoryMap),
    [quickCart, inventoryMap]
  )

  const manualSummary = useMemo(
    () => buildCartSummary(manualCart, inventoryMap),
    [manualCart, inventoryMap]
  )

  const activeSession = activeSessionId ? sessionsMap.get(activeSessionId) ?? null : null
  const activeSessionSummary = useMemo(
    () => (activeSession ? buildCartSummary(activeSession.items, inventoryMap) : null),
    [activeSession, inventoryMap]
  )

  const getSaleCart = (flow: PaymentFlow | null) => {
    if (!flow) return null
    if (flow.source === 'quick') return quickCart
    if (flow.source === 'manual') return manualCart
    return sessionsMap.get(flow.sessionId)?.items ?? null
  }

  const getSaleLabel = (flow: PaymentFlow) => {
    if (flow.source === 'quick') return 'Quick Sale'
    if (flow.source === 'manual') return 'Manual Sale'
    return sessionsMap.get(flow.sessionId)?.label ?? 'Customer'
  }

  const computeSaleDetail = (flow: PaymentFlow): SaleDetail | null => {
    const cart = getSaleCart(flow)
    if (!cart || Object.keys(cart).length === 0) return null

    const lines: SaleLine[] = []

    Object.values(cart).forEach((line) => {
      const item = inventoryMap.get(line.itemId)
      if (!item) return
      const stockBefore = item.stock
      const stockAfter = Math.max(stockBefore - line.quantity, 0)
      lines.push({
        id: line.itemId,
        name: item.name,
        quantity: line.quantity,
        unit: item.unit,
        unitPrice: line.unitPrice,
        subtotal: line.quantity * line.unitPrice,
        stock: item.stock,
        stockBefore,
        stockAfter,
      })
    })

    if (!lines.length) return null

    const total = lines.reduce((sum, line) => sum + line.subtotal, 0)

    return {
      id: flow.referenceId,
      source: flow.source,
      sessionId: flow.sessionId,
      customerLabel: getSaleLabel(flow),
      method: flow.method ?? 'cash',
      total,
      timestamp: Date.now(),
      attempt: flow.attempt,
      lines,
      mpesaCode: flow.method === 'mpesa' ? generateMpesaCode() : undefined,
      phoneNumber: flow.method === 'mpesa' ? flow.phoneNumber : undefined,
    }
  }

  const startCheckout = (source: PaymentSource, sessionId: string) => {
    const cart = source === 'quick' ? quickCart : source === 'manual' ? manualCart : sessionsMap.get(sessionId)?.items
    if (!cart || Object.keys(cart).length === 0) return
    setLastSale(null)
    setProcessingStep(1)
    setProcessingSeconds(0)
    setMpesaPhone('')
    setMpesaPhoneError(null)
    setPaymentFlow({
      source,
      sessionId,
      referenceId: generateTransactionId(),
      stage: 'method',
      phoneNumber: undefined,
      attempt: 1,
    })
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    if (!paymentFlow) return

    if (method === 'mpesa') {
      setProcessingStep(1)
      setProcessingSeconds(0)
      setMpesaPhoneError(null)
      const nextFlow: PaymentFlow = {
        ...paymentFlow,
        method,
        stage: 'method',
        phoneNumber: paymentFlow.phoneNumber,
        errorCode: undefined,
      }
      setPaymentFlow(nextFlow)
      if (paymentFlow.phoneNumber) {
        setMpesaPhone(paymentFlow.phoneNumber)
      }
      return
    }

    const nextFlow: PaymentFlow = {
      ...paymentFlow,
      method,
      stage: 'success',
      phoneNumber: undefined,
      errorCode: undefined,
    }
    setMpesaPhoneError(null)
    handlePaymentSuccess(nextFlow)
  }

  const handleSendMpesaPush = () => {
    if (!paymentFlow) return
    const normalized = normalizePhoneNumber(mpesaPhone)
    if (!normalized || !isLikelyValidMpesaNumber(normalized)) {
      setMpesaPhoneError('Enter a valid Kenyan M-Pesa number (e.g. 07XX XXX XXX).')
      return
    }

    setMpesaPhone(normalized)
    setMpesaPhoneError(null)
    setProcessingStep(1)
    setProcessingSeconds(0)
    setPaymentFlow({
      ...paymentFlow,
      method: 'mpesa',
      stage: 'processing',
      phoneNumber: normalized,
      errorCode: undefined,
    })
  }

  const handlePaymentSuccess = async (flow: PaymentFlow) => {
    if (!flow.method) return

    const saleDetail = computeSaleDetail(flow)
    if (!saleDetail) return

    const cart = getSaleCart(flow)
    if (!cart) return

    // Call backend API to complete the sale
    const success = await backendCompleteSale(cart, flow.method)

    if (!success) {
      // If backend fails, show error
      handlePaymentFailure(flow, 'ERR_BACKEND_FAILED')
      return
    }

    // Update local inventory optimistically (will be synced from backend on refetch)
    setInventory((prev) =>
      prev.map((item) => {
        const line = cart[item.id]
        if (!line) return item
        const newStock = Math.max(item.stock - line.quantity, 0)
        return {
          ...item,
          stock: newStock,
          status: newStock <= 0 ? 'out-of-stock' : 'available',
        }
      })
    )

    if (flow.source === 'quick') {
      setQuickCart({})
    } else if (flow.source === 'manual') {
      setManualCart({})
    } else {
      setSessions((prev) => {
        const updated = prev.filter((session) => session.id !== flow.sessionId)
        const fallback = updated[0]?.id ?? ''
        setActiveSessionId((current) => (current === flow.sessionId ? fallback : current))
        return updated
      })
    }

    setLastSale(saleDetail)
    setPaymentFlow({ ...flow, stage: 'success' })
    setProcessingStep(0)

    // Refresh inventory from backend to ensure sync
    refetchData()
  }

  const handlePaymentFailure = (flow: PaymentFlow, errorCode: string) => {
    setPaymentFlow({ ...flow, stage: 'failure', errorCode })
  }

  const handleProcessingCancel = () => {
    if (!paymentFlow) return
    handlePaymentFailure(paymentFlow, 'ERR_CUSTOMER_CANCELLED')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleProcessingComplete = () => {
    if (!paymentFlow) return
    handlePaymentSuccess(paymentFlow)
  }

  useEffect(() => {
    if (paymentFlow?.stage === 'processing') {
      setProcessingSeconds(0)
    }
  }, [paymentFlow?.stage])

  useEffect(() => {
    if (paymentFlow?.stage !== 'processing') return

    const interval = window.setInterval(() => {
      setProcessingSeconds((secs) => secs + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [paymentFlow?.stage])

  useEffect(() => {
    if (paymentFlow?.stage !== 'processing') return

    if (processingStep >= 3) {
      const timeout = window.setTimeout(() => {
        handleProcessingComplete()
      }, 900)
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => {
      setProcessingStep((prev) => Math.min(prev + 1, 3))
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [handleProcessingComplete, paymentFlow, processingStep])

  const closePaymentFlow = () => {
    setPaymentFlow(null)
    setProcessingStep(1)
    setProcessingSeconds(0)
    setMpesaPhone('')
    setMpesaPhoneError(null)
  }

  const proceedToSaleComplete = () => {
    if (!paymentFlow || !lastSale) return
    setPaymentFlow({ ...paymentFlow, stage: 'saleComplete' })
  }

  const finishSale = () => {
    closePaymentFlow()
    if (lastSale?.source === 'quick') {
      setActiveTab('quick')
    } else if (lastSale?.source === 'manual') {
      setActiveTab('manual')
    } else {
      setActiveTab('multi')
    }
  }

  const handleQuickAdd = (itemId: string) => {
    const item = inventoryMap.get(itemId)
    if (!item || item.stock <= 0) return
    const current = quickCart[itemId]?.quantity ?? 0
    const available = getRemainingStock(itemId, current)
    if (available <= current) return
    setQuickCart((prev) => ({
      ...prev,
      [itemId]: {
        itemId,
        quantity: current + 1,
        unitPrice: item.pricePerUnit,
      },
    }))
  }

  const handleQuickRemove = (itemId: string) => {
    setQuickCart((prev) => {
      if (!prev[itemId]) return prev
      const updated = { ...prev }
      delete updated[itemId]
      return updated
    })
  }

  const handleManualToggle = (itemId: string) => {
    setManualEditingId((current) => (current === itemId ? null : itemId))
    setManualDrafts((prev) => {
      if (prev[itemId]) return prev
      const item = inventoryMap.get(itemId)
      return {
        ...prev,
        [itemId]: {
          quantity: (manualCart[itemId]?.quantity ?? 1).toString(),
          unitPrice: (manualCart[itemId]?.unitPrice ?? item?.pricePerUnit ?? 0).toString(),
        },
      }
    })
  }

  const handleManualDraftChange = (itemId: string, field: keyof ManualDraft, value: string) => {
    setManualDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? { quantity: '1', unitPrice: '0' }),
        [field]: value,
      },
    }))
  }

  const handleManualAdd = (itemId: string) => {
    const item = inventoryMap.get(itemId)
    const draft = manualDrafts[itemId]
    if (!item || !draft) return

    const quantity = Math.floor(Number(draft.quantity))
    const unitPrice = Number(draft.unitPrice)
    if (!quantity || quantity <= 0 || !unitPrice || unitPrice <= 0) return

    const current = manualCart[itemId]?.quantity ?? 0
    const available = getRemainingStock(itemId, current)
    if (quantity > available) {
      handleManualDraftChange(itemId, 'quantity', available.toString())
      return
    }

    setManualCart((prev) => ({
      ...prev,
      [itemId]: {
        itemId,
        quantity,
        unitPrice,
      },
    }))
    setManualEditingId(null)
  }

  const handleManualRemove = (itemId: string) => {
    setManualCart((prev) => {
      if (!prev[itemId]) return prev
      const updated = { ...prev }
      delete updated[itemId]
      return updated
    })
  }

  const handleSessionQuantityChange = (sessionId: string, itemId: string, delta: number) => {
    const session = sessionsMap.get(sessionId)
    const item = inventoryMap.get(itemId)
    if (!session || !item) return

    const currentQuantity = session.items[itemId]?.quantity ?? 0
    const nextQuantity = currentQuantity + delta
    if (nextQuantity < 0) return

    if (nextQuantity === 0) {
      setSessions((prev) =>
        prev.map((entry) => {
          if (entry.id !== sessionId) return entry
          const updatedItems = { ...entry.items }
          delete updatedItems[itemId]
          return { ...entry, items: updatedItems }
        })
      )
      return
    }

    const available = getRemainingStock(itemId, currentQuantity)
    if (nextQuantity > available) return

    setSessions((prev) =>
      prev.map((entry) => {
        if (entry.id !== sessionId) return entry
        return {
          ...entry,
          items: {
            ...entry.items,
            [itemId]: {
              itemId,
              quantity: nextQuantity,
              unitPrice: item.pricePerUnit,
            },
          },
        }
      })
    )
  }

  const handleSessionItemAdd = (sessionId: string, itemId: string) => {
    handleSessionQuantityChange(sessionId, itemId, 1)
  }

  const handleSessionItemRemove = (sessionId: string, itemId: string) => {
    handleSessionQuantityChange(sessionId, itemId, -1)
  }

  const handleSessionTabSelect = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  const computeNextCustomerLabel = () => {
    let maxNumber = 0
    sessions.forEach((session) => {
      const match = session.label.match(/Customer\s+(\d+)/)
      if (match) {
        const num = Number(match[1])
        if (num > maxNumber) maxNumber = num
      }
    })
    return `Customer ${maxNumber + 1}`
  }

  const handleSessionCreate = () => {
    const newSession: CustomerSession = {
      id: `session-${Date.now()}`,
      label: computeNextCustomerLabel(),
      createdAt: Date.now(),
      status: 'in-progress',
      items: {},
    }
    setSessions((prev) => [...prev, newSession])
    setActiveSessionId(newSession.id)
  }

  const handleSessionClose = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((session) => session.id !== sessionId)
      const fallback = updated[0]?.id ?? ''
      setActiveSessionId((current) => (current === sessionId ? fallback : current))
      return updated
    })
  }

  const processingSteps = [
    'STK Push sent successfully',
    'Waiting for customer response',
    'Payment confirmation',
    'Transaction complete',
  ]

  const handleResendStk = () => {
    setProcessingStep(1)
    setProcessingSeconds(0)
  }

  const handleTryMpesaAgain = () => {
    if (!paymentFlow) return
    setProcessingStep(1)
    setProcessingSeconds(0)
    setMpesaPhone(paymentFlow.phoneNumber ?? mpesaPhone)
    setPaymentFlow({
      ...paymentFlow,
      stage: 'processing',
      attempt: paymentFlow.attempt + 1,
      errorCode: undefined,
    })
  }

  const handleSwitchToCash = () => {
    if (!paymentFlow) return
    setMpesaPhoneError(null)
    handleMethodSelect('cash')
  }

  const handleCancelPayment = () => {
    closePaymentFlow()
  }

  const renderInventoryEmptyState = (
    title = 'No inventory yet',
    subtitle = 'Add stock from the Inventory page to start selling.'
  ) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon} aria-hidden>
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20 32 10l22 10v24L32 54 10 44V20z" />
          <path d="M10 20 32 30l22-10" />
          <path d="M32 30v24" />
        </svg>
      </div>
      <p className={styles.emptyStateTitle}>{title}</p>
      <p className={styles.emptyStateSubtitle}>{subtitle}</p>
      <Button variant="secondary" onClick={() => navigate('/inventory')}>
        Go to Inventory
      </Button>
    </div>
  )

  const renderInventoryCard = (item: InventoryItem, onSelect?: () => void, footer?: ReactNode) => {
    const isOut = item.stock <= 0 || item.status === 'out-of-stock'
    const clickable = Boolean(onSelect) && !isOut

    const cardClasses = [styles.itemCard]
    if (clickable) cardClasses.push(styles.itemCardInteractive)
    if (isOut) cardClasses.push(styles.itemCardDisabled)

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect?.()
      }
    }

    return (
      <div
        key={item.id}
        className={cardClasses.join(' ')}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onSelect?.() : undefined}
        onKeyDown={handleKeyDown}
        aria-disabled={isOut}
      >
        <div className={styles.itemHeader}>
          <span className={styles.itemName}>{item.name}</span>
          <span className={styles.itemStock}>{formatStockLabel(item.stock, item.unit)}</span>
        </div>
        <div className={styles.itemPrice}>
          {formatCurrency(item.pricePerUnit)}/{item.unit === 'pieces' ? 'piece' : 'item'}
        </div>
        {isOut && <span className={styles.outOfStockLabel}>Unavailable</span>}
        {item.status === 'out-of-stock' && <span className={styles.outOfStockBadge}>Out of Stock</span>}
        {footer}
      </div>
    )
  }

  const renderCartCard = (
    title: string,
    summary: CartSummary,
    checkoutSource: PaymentSource,
    sessionId: string,
    emptyMessage?: string
  ) => (
    <div className={styles.cartCard}>
      <div className={styles.cartHeader}>
        <span>
          🛒 {title} ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
        </span>
        <span>{formatCurrency(summary.total)}</span>
      </div>
      {summary.lines.length === 0 ? (
        <div className={styles.cartEmpty}>{emptyMessage ?? 'Cart is empty. Tap items above to add them.'}</div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {summary.lines.map((line) => {
              const lineKey = makeLineKey(checkoutSource, sessionId, line.id)
              return (
                <div key={line.id} className={styles.cartRow}>
                  <div className={styles.cartRowMain}>
                  <span className={styles.cartItemName}>{line.name}</span>
                  <span className={styles.cartItemMeta}>
                    Current price: {formatCurrency(line.unitPrice)} each • {formatQuantity(line.quantity, line.unit)}
                  </span>
                    <div className={styles.cartEditor}>
                    <label className={styles.cartInputGroup}>
                      <span className={styles.cartInputLabel}>Items sold</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={quantityDrafts[lineKey] ?? line.quantity.toString()}
                        onChange={(event) => handleQuantityDraftChange(lineKey, event.target.value)}
                        onBlur={() => commitQuantityDraft(checkoutSource, sessionId, line.id, lineKey)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur()
                        }}
                        className={styles.cartInput}
                      />
                    </label>
                    <label className={styles.cartInputGroup}>
                      <span className={styles.cartInputLabel}>Sale price (each)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceDrafts[lineKey] ?? formatInputNumber(line.unitPrice)}
                        onChange={(event) => handlePriceDraftChange(lineKey, event.target.value)}
                        onBlur={() => commitPriceDraft(checkoutSource, sessionId, line.id, lineKey)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur()
                        }}
                        className={styles.cartInput}
                      />
                    </label>
                      <span className={styles.cartStockNote}>
                        In stock: {formatStockLabel(line.stock, line.unit)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cartRowActions}>
                    <span className={styles.cartAmount}>{formatCurrency(line.subtotal)}</span>
                    <button
                      type="button"
                      className={styles.cartRemoveButton}
                      onClick={() => handleRemoveLine(checkoutSource, sessionId, line.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.cartTotal}>
            <span>Total:</span>
            <span>{formatCurrency(summary.total)}</span>
          </div>
          <div className={styles.cartActions}>
            <button
              type="button"
              className={styles.cartButton}
              onClick={() => startCheckout(checkoutSource, sessionId)}
              disabled={summary.lines.length === 0}
            >
              {checkoutSource === 'session' ? `Complete Payment for ${title}` : 'Complete Payment'}
            </button>
          </div>
        </>
      )}
    </div>
  )

  const renderQuickSell = () => (
    <div className={styles.page}>
      <div className={styles.viewHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Quick Sell</h2>
          <p className={styles.sectionSubtitle}>Tap items to add to cart</p>
        </div>
      </div>

      {inventory.length === 0 ? (
        renderInventoryEmptyState(
          'No products available for sale',
          'Record your first stock on the Inventory page to start quick sales.'
        )
      ) : (
        <div className={styles.inventoryGrid}>
          {inventory.map((item) => renderInventoryCard(item, () => handleQuickAdd(item.id)))}
        </div>
      )}

      {renderCartCard(
        'Cart',
        quickSummary,
        'quick',
        'quick',
        inventory.length === 0 ? 'Add products to your inventory before building a cart.' : undefined
      )}
    </div>
  )

  const renderManualSale = () => (
    <div className={styles.page}>
      <div className={styles.viewHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Manual Sale</h2>
          <p className={styles.sectionSubtitle}>Enter custom quantities and prices</p>
        </div>
      </div>

      {inventory.length === 0 ? (
        renderInventoryEmptyState(
          'No products to configure',
          'Add items to your inventory before creating manual sales.'
        )
      ) : (
        <div className={styles.inventoryGrid}>
          {inventory.map((item) => {
            const isEditing = manualEditingId === item.id
            const draft = manualDrafts[item.id]
            return renderInventoryCard(item, () => handleManualToggle(item.id), isEditing && draft ? (
                <div
                  className={styles.manualConfigCard}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <div className={styles.manualFields}>
                    <label className={styles.manualField}>
                      <span className={styles.manualLabel}>Items sold</span>
                      <input
                        className={styles.manualInput}
                        type="number"
                        min="0"
                        value={draft.quantity}
                        onChange={(event) => handleManualDraftChange(item.id, 'quantity', event.target.value)}
                      />
                    </label>
                    <label className={styles.manualField}>
                      <span className={styles.manualLabel}>Sale price per item</span>
                      <input
                        className={styles.manualInput}
                        type="number"
                        min="0"
                        value={draft.unitPrice}
                        onChange={(event) => handleManualDraftChange(item.id, 'unitPrice', event.target.value)}
                      />
                    </label>
                  </div>
                  <button type="button" className={styles.manualAddButton} onClick={() => handleManualAdd(item.id)}>
                    Add to Cart
                  </button>
                </div>
              ) : undefined)
          })}
        </div>
      )}

      {renderCartCard(
        'Cart Summary',
        manualSummary,
        'manual',
        'manual',
        inventory.length === 0 ? 'Add products to your inventory before building a cart.' : undefined
      )}
    </div>
  )

  const renderSessionTabs = () => (
    <div className={styles.sessionTabs}>
      {sessions.map((session) => (
        <div
          key={session.id}
          role="button"
          tabIndex={0}
          className={`${styles.sessionTab} ${session.id === activeSessionId ? styles.sessionTabActive : ''}`}
          onClick={() => handleSessionTabSelect(session.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') handleSessionTabSelect(session.id)
          }}
        >
          <span>
            {session.label} • {Object.values(session.items).length} items • {formatCurrency(buildCartSummary(session.items, inventoryMap).total)}
          </span>
          <button
            type="button"
            className={styles.sessionCloseButton}
            onClick={(event) => {
              event.stopPropagation()
              handleSessionClose(session.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className={styles.newSessionButton} onClick={handleSessionCreate}>
        + New Customer
      </button>
    </div>
  )

  const renderMultiCart = () => (
    <div className={styles.multiLayout}>
      <div className={styles.viewHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Multi-Cart Sales</h2>
          <p className={styles.sectionSubtitle}>Manage multiple customer sessions</p>
        </div>
        <span className={styles.badgeSuccess}>{sessions.length} active sessions</span>
      </div>

      {renderSessionTabs()}

      {activeSession ? (
        <div className={styles.customerCard}>
          <div className={styles.customerHeader}>
            <div>
              <div className={styles.customerLabel}>{activeSession.label}</div>
              <div className={styles.customerMeta}>
                Created {relativeTimeFrom(activeSession.createdAt)} • {activeSessionSummary?.lines.length ?? 0} items
              </div>
            </div>
            <div className={styles.customerTotal}>{formatCurrency(activeSessionSummary?.total ?? 0)}</div>
          </div>

          {inventory.length === 0 ? (
            renderInventoryEmptyState(
              'No inventory available',
              'Add stock to your catalogue to start multi-cart sessions.'
            )
          ) : (
            <div className={styles.inventoryGrid}>
              {inventory.map((item) => {
                const line = activeSession.items[item.id]
                const footer = line ? (
                    <div
                      className={styles.quantityControl}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <button type="button" className={styles.quantityButton} onClick={() => handleSessionItemRemove(activeSession.id, item.id)}>
                        −
                      </button>
                      <span className={styles.quantityValue}>{line.quantity} {line.quantity === 1 ? 'item' : 'items'}</span>
                      <button type="button" className={styles.quantityButton} onClick={() => handleSessionItemAdd(activeSession.id, item.id)}>
                        +
                      </button>
                    </div>
                ) : undefined

                return renderInventoryCard(item, () => handleSessionItemAdd(activeSession.id, item.id), footer)
              })}
            </div>
          )}

          {activeSessionSummary &&
            renderCartCard(
              activeSession.label,
              activeSessionSummary,
              'session',
              activeSession.id,
              inventory.length === 0 ? 'Add products to your inventory before building a cart.' : undefined
            )}
        </div>
      ) : (
        <div className={styles.cartCard}>
          <div className={styles.cartEmpty}>Create a customer session to start selling.</div>
        </div>
      )}

      <div className={styles.activeSessionsCard}>
        <div className={styles.cartHeader}>All Active Sessions</div>
        {sessions.length === 0 ? (
          <div className={styles.cartEmpty}>No customer sessions yet. Use + New Customer to start one.</div>
        ) : (
          sessions.map((session) => {
            const summary = buildCartSummary(session.items, inventoryMap)
            const isActive = session.id === activeSessionId
            return (
              <div
                key={session.id}
                className={`${styles.sessionListItem} ${isActive ? styles.sessionListItemActive : ''}`}
                onClick={() => handleSessionTabSelect(session.id)}
              >
                <span>
                  {session.label} • {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} • {relativeTimeFrom(session.createdAt)}
                </span>
                <span>{formatCurrency(summary.total)}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderMethodSelection = (flow: PaymentFlow) => {
    const summary = buildCartSummary(getSaleCart(flow) ?? {}, inventoryMap)
    return (
      <div className={styles.paymentView}>
        <div className={styles.paymentCard}>
          <div>
            <h2 className={styles.paymentTitle}>Complete Payment</h2>
            <p className={styles.paymentSubtitle}>Choose your payment method</p>
          </div>

          <div>
            <div className={styles.sectionTitle}>Order Summary</div>
            <div className={styles.orderTable}>
              {summary.lines.map((line) => (
                <div key={line.id} className={styles.orderRow}>
                  <div>
                    <div>{line.name}</div>
                    <div className={styles.orderMeta}>
                      {formatQuantity(line.quantity, line.unit)} × {formatCurrency(line.unitPrice)}
                    </div>
                  </div>
                  <div>{formatCurrency(line.subtotal)}</div>
                </div>
              ))}
              <div className={styles.orderRow}>
                <div>
                  <strong>Total Amount</strong>
                  <div className={styles.orderMeta}>
                    {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <div className={styles.orderTotal}>{formatCurrency(summary.total)}</div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Select Payment Method</div>
            <div className={styles.paymentMethods}>
              <button
                type="button"
                className={`${styles.methodButton} ${flow.method === 'cash' ? styles.methodButtonActive : ''}`}
                onClick={() => handleMethodSelect('cash')}
              >
                <span>Cash Payment</span>
                <span className={styles.metaMuted}>Instant completion</span>
              </button>
              <button
                type="button"
                className={`${styles.methodButton} ${flow.method === 'mpesa' ? styles.methodButtonActive : ''}`}
                onClick={() => handleMethodSelect('mpesa')}
              >
                <span>M-Pesa</span>
                <span className={styles.metaMuted}>STK Push payment</span>
              </button>
              <button
                type="button"
                className={`${styles.methodButton} ${flow.method === 'card' ? styles.methodButtonActive : ''}`}
                onClick={() => handleMethodSelect('card')}
              >
                <span>Card Payment</span>
                <span className={styles.metaMuted}>Debit/Credit card</span>
              </button>
            </div>
          </div>

          {flow.method === 'mpesa' && (
            <div className={styles.mpesaForm}>
              <label className={styles.mpesaLabel} htmlFor="mpesa-phone">
                Customer phone number for STK push
              </label>
              <input
                id="mpesa-phone"
                className={styles.mpesaInput}
                type="tel"
                inputMode="tel"
                placeholder="07XX XXX XXX"
                value={mpesaPhone}
                onChange={(event) => {
                  setMpesaPhone(event.target.value)
                  setMpesaPhoneError(null)
                }}
              />
              <span className={styles.mpesaHelper}>We will send an STK push to this number for the customer to approve.</span>
              {mpesaPhoneError && <span className={styles.mpesaError}>{mpesaPhoneError}</span>}
              <div className={styles.mpesaActions}>
                <button
                  type="button"
                  className={styles.mpesaSendButton}
                  onClick={handleSendMpesaPush}
                  disabled={!mpesaPhone.trim()}
                >
                  Send STK Push
                </button>
                {flow.phoneNumber && (
                  <span className={styles.metaMuted}>Last sent to: {flow.phoneNumber}</span>
                )}
              </div>
            </div>
          )}

          <div className={styles.stackedButtons}>
            <button type="button" className={styles.cartButton} onClick={handleCancelPayment}>
              Cancel Payment
            </button>
          </div>
        </div>
        <div className={styles.metaMuted}>
          Transaction ID: {flow.referenceId} • Date &amp; Time: {new Date().toLocaleString()} • Cashier: Admin User
        </div>
      </div>
    )
  }

  const renderProcessing = (flow: PaymentFlow) => {
    const summary = buildCartSummary(getSaleCart(flow) ?? {}, inventoryMap)
    const formatSeconds = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
    return (
      <div className={styles.paymentView}>
        <div className={styles.paymentCard}>
          <div className={styles.successHighlight}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
              <circle cx="36" cy="36" r="35" stroke="#2563eb" strokeWidth="2" />
              <path d="M36 18v16l11 11" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className={styles.paymentTitle}>Processing Payment</h2>
            <p className={styles.paymentSubtitle}>Please wait while we process your transaction</p>
            <div className={styles.successAmount}>{formatCurrency(summary.total)}</div>
            <p className={styles.paymentSubtitle}>Amount to be deducted</p>
          </div>

          <div className={styles.processingStatus}>
            <div>
              <strong>Processing Time:</strong> {formatSeconds(processingSeconds)}
            </div>
            <div>
              <strong>Connection Status:</strong> <span className={styles.badgeSuccess}>Strong</span>
            </div>
            <div>
              <strong>Transaction ID:</strong> {flow.referenceId}
            </div>
            <div>
              <strong>Phone Number:</strong> {flow.phoneNumber ?? mpesaPhone}
            </div>
            <div>
              <strong>Payment Method:</strong> M-Pesa STK Push
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Customer Instructions</div>
            <ol className={styles.helperList}>
              <li>Check your phone for M-Pesa notification</li>
              <li>Enter your M-Pesa PIN when prompted</li>
              <li>Confirm the payment amount ({formatCurrency(summary.total)})</li>
              <li>Wait for confirmation message</li>
            </ol>
          </div>

          <div className={styles.statusList}>
            {processingSteps.map((step, index) => {
              const statusClass =
                processingStep > index
                  ? styles.statusBadgeDone
                  : processingStep === index
                  ? styles.statusBadgeActive
                  : ''
              return (
                <div key={step} className={styles.statusItem}>
                  <span className={`${styles.statusBadge} ${statusClass}`} />
                  <span>{step}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.inlineActions}>
            <button type="button" className={`${styles.inlineActionButton} ${styles.inlineActionAlt}`} onClick={handleResendStk}>
              Resend STK Push
            </button>
            <button type="button" className={styles.inlineActionButton} onClick={handleProcessingCancel}>
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSuccess = () => {
    if (!lastSale) return null
    return (
      <div className={styles.paymentView}>
        <div className={styles.paymentCard}>
          <div className={styles.successHighlight}>
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden>
              <circle cx="48" cy="48" r="46" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
              <path d="M32 49.5 43 60l21-25" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className={styles.paymentTitle}>Payment Successful!</h2>
            <p className={styles.paymentSubtitle}>Transaction completed successfully</p>
            <div className={styles.successAmount}>{formatCurrency(lastSale.total)}</div>
            <span className={styles.badgeSuccess}>{lastSale.method === 'mpesa' ? 'M-Pesa' : lastSale.method.toUpperCase()}</span>
          </div>

          <div>
            <div className={styles.sectionTitle}>Transaction Details</div>
            <div className={styles.orderTable}>
              <div className={styles.orderRow}>
                <div>Transaction ID:</div>
                <div>{lastSale.id}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Payment Method:</div>
                <div>{lastSale.method === 'mpesa' ? 'M-Pesa' : lastSale.method === 'cash' ? 'Cash' : 'Card'}</div>
              </div>
              {lastSale.phoneNumber && (
                <div className={styles.orderRow}>
                  <div>Phone Number:</div>
                  <div>{lastSale.phoneNumber}</div>
                </div>
              )}
              {lastSale.mpesaCode && (
                <div className={styles.orderRow}>
                  <div>M-Pesa Code:</div>
                  <div>{lastSale.mpesaCode}</div>
                </div>
              )}
              <div className={styles.orderRow}>
                <div>Date &amp; Time:</div>
                <div>{new Date(lastSale.timestamp).toLocaleString()}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Status:</div>
                <div className={styles.badgeSuccess}>Completed</div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Items Purchased</div>
            <div className={styles.orderTable}>
              {lastSale.lines.map((line) => (
                <div key={line.id} className={styles.orderRow}>
                  <div>
                    <div>{line.name}</div>
                    <div className={styles.orderMeta}>{formatQuantity(line.quantity, line.unit)}</div>
                  </div>
                  <div>{formatCurrency(line.subtotal)}</div>
                </div>
              ))}
              <div className={styles.orderRow}>
                <strong>Total:</strong>
                <strong>{formatCurrency(lastSale.total)}</strong>
              </div>
            </div>
          </div>

          <div className={styles.helperPanel}>
            <strong>Stock Updated</strong>
            <p>Inventory has been automatically updated for all purchased items.</p>
          </div>

          <div className={styles.centeredActions}>
            <Button variant="primary" onClick={proceedToSaleComplete}>
              Continue
            </Button>
            <Button variant="ghost" onClick={finishSale}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderSaleComplete = () => {
    if (!lastSale) return null
    return (
      <div className={styles.paymentView}>
        <div className={styles.paymentCard}>
          <div className={styles.successHighlight}>
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden>
              <circle cx="48" cy="48" r="46" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
              <path d="M32 49.5 43 60l21-25" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className={styles.paymentTitle}>Sale Complete!</h2>
            <p className={styles.paymentSubtitle}>Transaction successful and inventory updated</p>
            <div className={styles.successAmount}>{formatCurrency(lastSale.total)}</div>
            <div className={styles.paymentSubtitle}>
              Sale Revenue • {countItemsSold(lastSale.lines)} items sold • {lastSale.customerLabel}
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Stock Updates</div>
            <div className={styles.stockUpdates}>
              {lastSale.lines.map((line) => (
                <div key={line.id} className={styles.stockRow}>
                  <span>
                    {line.name}
                    <span className={styles.orderMeta}>
                      {' '}
                      Before {formatQuantity(line.stockBefore, line.unit)} → After {formatQuantity(line.stockAfter, line.unit)}
                    </span>
                  </span>
                  <span className={styles.stockLevelGood}>Good</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionTitle}>Transaction Summary</div>
          <div className={styles.orderTable}>
            <div className={styles.orderRow}>
              <div>Transaction ID:</div>
              <div>{lastSale.id}</div>
            </div>
            <div className={styles.orderRow}>
              <div>Completed At:</div>
              <div>{new Date(lastSale.timestamp).toLocaleString()}</div>
            </div>
            <div className={styles.orderRow}>
              <div>Payment Method:</div>
              <div>{lastSale.method === 'mpesa' ? 'M-Pesa' : lastSale.method === 'cash' ? 'Cash' : 'Card'}</div>
            </div>
            <div className={styles.orderRow}>
              <div>Status:</div>
              <div className={styles.badgeSuccess}>Completed</div>
            </div>
          </div>

          <div className={styles.centeredActions}>
            <Button variant="primary" onClick={finishSale}>
              Continue Selling
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          <div className={styles.helperPanel}>
            <div className={styles.sectionTitle}>Recommended Next Steps</div>
            <ul className={styles.helperList}>
              <li>Review daily sales performance</li>
              <li>Continue serving customers</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderFailure = (flow: PaymentFlow) => {
    const summary = buildCartSummary(getSaleCart(flow) ?? {}, inventoryMap)
    return (
      <div className={styles.paymentView}>
        <div className={styles.failureCard}>
          <div className={styles.successHighlight}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
              <circle cx="40" cy="40" r="38" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
              <path d="M40 24v20" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
              <circle cx="40" cy="52" r="4" fill="#dc2626" />
            </svg>
            <h2 className={styles.paymentTitle}>Payment Failed</h2>
            <p className={styles.paymentSubtitle}>Transaction could not be completed</p>
            <div className={styles.failureAmount}>{formatCurrency(summary.total)}</div>
            <span className={styles.badgeWarning}>{flow.method === 'mpesa' ? 'M-Pesa Payment' : 'Payment Failed'}</span>
          </div>

          <div>
            <div className={styles.sectionTitle}>Insufficient Funds</div>
            <p>Customer does not have enough balance in their M-Pesa account.</p>
            <p className={styles.paymentSubtitle}>Recommended action: Ask customer to top up their M-Pesa account.</p>
          </div>

          <div>
            <div className={styles.sectionTitle}>Transaction Attempt Details</div>
            <div className={styles.orderTable}>
              <div className={styles.orderRow}>
                <div>Transaction ID:</div>
                <div>{flow.referenceId}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Phone Number:</div>
                <div>{flow.phoneNumber ?? '-'}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Amount:</div>
                <div>{formatCurrency(summary.total)}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Attempt #{flow.attempt}</div>
                <div>{new Date().toLocaleTimeString()}</div>
              </div>
              <div className={styles.orderRow}>
                <div>Error Code:</div>
                <div>{flow.errorCode ?? 'ERR_INSUFFICIENT_FUNDS'}</div>
              </div>
            </div>
          </div>

          <div className={styles.helperPanel}>
            <div className={styles.sectionTitle}>What can you do?</div>
            <ul className={styles.helperList}>
              <li>Try again with the same payment method</li>
              <li>Switch to cash payment instead</li>
              <li>Contact M-Pesa customer service if the problem persists</li>
            </ul>
          </div>

          <div className={styles.inlineActions}>
            <button type="button" className={styles.inlineActionButton} onClick={handleTryMpesaAgain}>
              Try M-Pesa Again
            </button>
            <button type="button" className={`${styles.inlineActionButton} ${styles.inlineActionAlt}`} onClick={handleSwitchToCash}>
              Switch to Cash Payment
            </button>
            <button type="button" className={styles.inlineActionButton} onClick={handleCancelPayment}>
              Cancel Transaction
            </button>
          </div>

          <div className={styles.helperPanel}>
            <strong>Need Help?</strong>
            <p>If this problem persists, contact M-Pesa customer service or ask the customer to check their phone network connection.</p>
          </div>
        </div>
      </div>
    )
  }

  const renderPaymentFlow = () => {
    if (!paymentFlow) return null

    if (paymentFlow.stage === 'method') return renderMethodSelection(paymentFlow)
    if (paymentFlow.stage === 'processing') return renderProcessing(paymentFlow)
    if (paymentFlow.stage === 'success') return renderSuccess()
    if (paymentFlow.stage === 'saleComplete') return renderSaleComplete()
    if (paymentFlow.stage === 'failure') return renderFailure(paymentFlow)

    return null
  }

  const renderActiveTab = () => {
    if (activeTab === 'quick') return renderQuickSell()
    if (activeTab === 'manual') return renderManualSale()
    return renderMultiCart()
  }

  if (isLoadingData) {
    return (
      <MainLayout title="Sales" subtitle="Sell items, process payments, and update stock">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sales data...</div>
      </MainLayout>
    )
  }

  if (dataError) {
    return (
      <MainLayout title="Sales" subtitle="Sell items, process payments, and update stock">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          Error loading sales data: {dataError}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Sales" subtitle="Sell items, process payments, and update stock">
      <div className={styles.viewHeader}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'quick' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            Quick Sell
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'manual' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Sale
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'multi' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('multi')}
          >
            Multi-Cart
          </button>
        </div>
        {(activeTab === 'quick' || activeTab === 'manual') && (
          <Button variant="secondary" onClick={() => startCheckout(activeTab, activeTab)} disabled={(activeTab === 'quick' ? quickSummary.lines.length : manualSummary.lines.length) === 0}>
            Proceed to Payment
          </Button>
        )}
      </div>

      {paymentFlow ? renderPaymentFlow() : renderActiveTab()}
    </MainLayout>
  )
}

export default SalesPage