/* Shared types for the AI data reader (Lector de Datos IA).
   The API structures pasted text / a URL into one of these shapes and returns
   a preview; the client edits it and persists via existing APIs
   (/api/prices for price_items, /api/apus for apus). */

export type LectorKind = "price_items" | "apus" | "unknown"

// A single price row — mirrors the /api/prices POST contract loosely.
// name → description, price → unit_price, supplier → code (on persist).
export interface PriceItem {
  name: string
  unit: string
  price: number
  category?: string
  supplier?: string
}

export type ApuComponentType = "material" | "mano_obra" | "equipo"

export interface ApuComponent {
  type: ApuComponentType
  name: string
  unit: string
  quantity: number
  unit_price: number
}

export interface Apu {
  code?: string
  name: string
  unit: string
  total?: number
  components: ApuComponent[]
}

export interface LectorResult {
  kind: LectorKind
  confianza: number // 0–1
  items: PriceItem[] | Apu[]
}

// ── Cotización mode (price_items only) ─────────────────────────
// When applying price_items, the user can target each row at either
// a brand-new price item (default, existing flow) or an existing one
// as a multi-source quote (POST /api/quotes).
export type ApplyMode = "new_items" | "quotes"

// Minimal shape of a /api/prices search match, used to pick a quote target.
export interface PriceItemMatch {
  id: string
  description: string
  unit: string
  unit_price: number
  category: string
}
