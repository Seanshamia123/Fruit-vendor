export type KeySku = {
  category: string
  variety: string
  grade: string
  batchDate: string
}

export type KeySkuColumns = Array<{ key: keyof KeySku; label: string }>

