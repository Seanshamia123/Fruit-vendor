// Minimal shared types used across the API surface.

export type Product = {
  id: number
  name: string
  // optional commonly-used fields
  sku?: string
  price?: number
  // allow additional fields returned by the backend
  [key: string]: any
}
