/* Costo mensual (y anual) de infraestructura cloud.
 *
 * Modelo simple de línea de ítem:
 *   costoMes_i = cantidad_i × precioUnitarioMes_i
 *
 * Se agrupan por categoría (cómputo, almacenamiento, transferencia, servicio)
 * para obtener subtotales, y se suman todos para el TOTAL MENSUAL.
 *
 *   Total mensual = Σ costoMes_i
 *
 * Si se pide proyección ANUAL, se aplica un descuento opcional (p.ej. por
 * compromiso anual / reserved instances) sobre el total anual sin descontar:
 *
 *   Total anual sin descuento = Total mensual × 12
 *   Total anual = Total anual sin descuento × (1 − descuentoAnualPct)
 *
 * Por defecto descuentoAnualPct = 0 (sin descuento).
 *
 * Los PRESETS incluidos son precios REFERENCIALES redondos para armar
 * ejemplos rápidos — NO representan tarifas reales de ningún proveedor
 * (AWS/Azure/GCP/otros). Editar según cotización real del proveedor elegido.
 *
 * Función pura, sin estado, sin dependencias de React/Next.
 */

export type CategoriaCloud = "computo" | "almacenamiento" | "transferencia" | "servicio"

export interface ItemCloud {
  id: string
  nombre: string
  categoria: CategoriaCloud
  cantidad: number
  unidad: string
  precioUnitarioMes: number
}

export interface OpcionesCostoCloud {
  anual?: boolean
  /** % de descuento sobre el total anual (default 0 = sin descuento). */
  descuentoAnualPct?: number
}

export interface ItemCalculado {
  id: string
  nombre: string
  categoria: CategoriaCloud
  costoMes: number
}

export interface SubtotalCategoria {
  categoria: CategoriaCloud
  costoMes: number
}

export interface CostoCloudResult {
  items: ItemCalculado[]
  subtotalesPorCategoria: SubtotalCategoria[]
  totalMensual: number
  anual: boolean
  descuentoAnualPct: number
  totalAnualSinDescuento: number | null
  totalAnual: number | null
}

const CATEGORIAS: CategoriaCloud[] = ["computo", "almacenamiento", "transferencia", "servicio"]

/** Redondeo a 2 decimales para presentación (no usar en cálculos intermedios). */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * PRESET de ejemplo: infraestructura pequeña típica (referencial, editar
 * según proveedor). Precios genéricos redondos, NO son tarifas reales.
 */
export const PRESET_INFRA_PEQUENA: ItemCloud[] = [
  { id: "vm-app", nombre: "Servidor de aplicación (VM)", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 50 },
  { id: "disco", nombre: "Almacenamiento en disco", categoria: "almacenamiento", cantidad: 100, unidad: "GB", precioUnitarioMes: 0.1 },
  { id: "salida-datos", nombre: "Transferencia de salida", categoria: "transferencia", cantidad: 200, unidad: "GB", precioUnitarioMes: 0.09 },
  { id: "bd-managed", nombre: "Base de datos administrada", categoria: "servicio", cantidad: 1, unidad: "instancia", precioUnitarioMes: 100 },
]

/**
 * PRESET de ejemplo: infraestructura mediana típica (referencial, editar
 * según proveedor). Precios genéricos redondos, NO son tarifas reales.
 */
export const PRESET_INFRA_MEDIANA: ItemCloud[] = [
  { id: "vm-app", nombre: "Servidor de aplicación (VM)", categoria: "computo", cantidad: 5, unidad: "instancia", precioUnitarioMes: 80 },
  { id: "vm-worker", nombre: "Servidor de procesos batch (VM)", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 60 },
  { id: "disco", nombre: "Almacenamiento en disco", categoria: "almacenamiento", cantidad: 1000, unidad: "GB", precioUnitarioMes: 0.1 },
  { id: "backup", nombre: "Almacenamiento de respaldo", categoria: "almacenamiento", cantidad: 500, unidad: "GB", precioUnitarioMes: 0.05 },
  { id: "salida-datos", nombre: "Transferencia de salida", categoria: "transferencia", cantidad: 1000, unidad: "GB", precioUnitarioMes: 0.09 },
  { id: "bd-managed", nombre: "Base de datos administrada", categoria: "servicio", cantidad: 1, unidad: "instancia", precioUnitarioMes: 200 },
  { id: "balanceador", nombre: "Balanceador de carga", categoria: "servicio", cantidad: 1, unidad: "instancia", precioUnitarioMes: 25 },
]

/**
 * Calcula el costo de infraestructura cloud: costo mensual por ítem,
 * subtotales por categoría, total mensual y, opcionalmente, proyección
 * anual con descuento. Función pura.
 */
export function calcularCostoCloud(items: ItemCloud[], opciones: OpcionesCostoCloud = {}): CostoCloudResult {
  const anual = opciones.anual ?? false
  const descuentoAnualPct = opciones.descuentoAnualPct ?? 0

  const itemsCalculados: ItemCalculado[] = items.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    categoria: item.categoria,
    costoMes: item.cantidad * item.precioUnitarioMes,
  }))

  const subtotalesPorCategoria: SubtotalCategoria[] = CATEGORIAS.map((categoria) => ({
    categoria,
    costoMes: itemsCalculados.filter((i) => i.categoria === categoria).reduce((acc, i) => acc + i.costoMes, 0),
  }))

  const totalMensual = itemsCalculados.reduce((acc, i) => acc + i.costoMes, 0)

  const totalAnualSinDescuento = anual ? totalMensual * 12 : null
  const totalAnual = anual ? (totalAnualSinDescuento as number) * (1 - descuentoAnualPct) : null

  return {
    items: itemsCalculados,
    subtotalesPorCategoria,
    totalMensual,
    anual,
    descuentoAnualPct,
    totalAnualSinDescuento,
    totalAnual,
  }
}

/* ── Autoverificación (no la usa la página) ──────────────────────────────── */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // Caso 1: 2 ítems simples. computo: 2×50=100. almacenamiento: 100×0.1=10.
  // Total mensual = 110.
  {
    const r = calcularCostoCloud([
      { id: "vm", nombre: "VM", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 50 },
      { id: "disco", nombre: "Disco", categoria: "almacenamiento", cantidad: 100, unidad: "GB", precioUnitarioMes: 0.1 },
    ])
    const computo = r.subtotalesPorCategoria.find((s) => s.categoria === "computo")!
    const almacenamiento = r.subtotalesPorCategoria.find((s) => s.categoria === "almacenamiento")!
    const ok = near(computo.costoMes, 100, 1e-9) && near(almacenamiento.costoMes, 10, 1e-9) && near(r.totalMensual, 110, 1e-9)
    results.push({
      name: "2 ítems (VM 2×$50 + disco 100×$0.1) → computo=100, almac=10, total=110",
      ok,
      detail: `computo=${computo.costoMes} almacenamiento=${almacenamiento.costoMes} total=${r.totalMensual}`,
    })
  }

  // Caso 2: mismo set, proyección anual SIN descuento. 110×12 = 1320.
  {
    const r = calcularCostoCloud(
      [
        { id: "vm", nombre: "VM", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 50 },
        { id: "disco", nombre: "Disco", categoria: "almacenamiento", cantidad: 100, unidad: "GB", precioUnitarioMes: 0.1 },
      ],
      { anual: true },
    )
    const ok = near(r.totalAnualSinDescuento ?? -1, 1320, 1e-9) && near(r.totalAnual ?? -1, 1320, 1e-9)
    results.push({
      name: "mismo set, anual sin descuento → 110×12=1320",
      ok,
      detail: `anualSinDesc=${r.totalAnualSinDescuento} anual=${r.totalAnual}`,
    })
  }

  // Caso 3: proyección anual CON 10% de descuento. 1320 × 0.9 = 1188.
  {
    const r = calcularCostoCloud(
      [
        { id: "vm", nombre: "VM", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 50 },
        { id: "disco", nombre: "Disco", categoria: "almacenamiento", cantidad: 100, unidad: "GB", precioUnitarioMes: 0.1 },
      ],
      { anual: true, descuentoAnualPct: 0.1 },
    )
    const ok = near(r.totalAnualSinDescuento ?? -1, 1320, 1e-9) && near(r.totalAnual ?? -1, 1188, 1e-6)
    results.push({
      name: "anual con 10% descuento → 1320×0.9=1188",
      ok,
      detail: `anualSinDesc=${r.totalAnualSinDescuento} anualConDesc=${r.totalAnual}`,
    })
  }

  // Caso 4: 4 categorías, un ítem cada una. Verifica subtotales y total con transferencia+servicio.
  // transferencia: 200×0.09=18. servicio: 1×100=100. Total = 100+10+18+100 = 228.
  {
    const r = calcularCostoCloud([
      { id: "vm", nombre: "VM", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 50 },
      { id: "disco", nombre: "Disco", categoria: "almacenamiento", cantidad: 100, unidad: "GB", precioUnitarioMes: 0.1 },
      { id: "salida", nombre: "Salida de datos", categoria: "transferencia", cantidad: 200, unidad: "GB", precioUnitarioMes: 0.09 },
      { id: "bd", nombre: "BD administrada", categoria: "servicio", cantidad: 1, unidad: "instancia", precioUnitarioMes: 100 },
    ])
    const transferencia = r.subtotalesPorCategoria.find((s) => s.categoria === "transferencia")!
    const servicio = r.subtotalesPorCategoria.find((s) => s.categoria === "servicio")!
    const ok = near(transferencia.costoMes, 18, 1e-9) && near(servicio.costoMes, 100, 1e-9) && near(r.totalMensual, 228, 1e-9)
    results.push({
      name: "4 categorías (computo+almac+transf+serv) → total=228",
      ok,
      detail: `transferencia=${transferencia.costoMes} servicio=${servicio.costoMes} total=${r.totalMensual}`,
    })
  }

  return { ok: results.every((r) => r.ok), results }
}
