/* Cubicación de tierras (corte / relleno) a partir de puntos topográficos.
 *
 * Método: malla regular (grid) + interpolación IDW (Inverse Distance Weighting).
 *
 *   1. Se calcula el bounding box del levantamiento (Xmin..Xmax, Ymin..Ymax).
 *   2. Se genera una malla regular de celdas cuadradas de lado `cellSize`.
 *   3. Para el centro de cada celda se estima la cota de terreno Z_terr por IDW:
 *
 *          Z(p) = Σ ( z_i / d_i^k ) / Σ ( 1 / d_i^k )
 *
 *      con k = potencia (2 por defecto) y d_i = distancia del centro al punto i.
 *      Sólo se usan los puntos dentro de un `searchRadius` (radio adaptativo:
 *      por defecto ~ el paso de una celda escalado, ver `defaultCellSize`).
 *      Si el centro coincide con un punto (d≈0) se toma su cota directa.
 *
 *   4. El volumen de cada celda respecto a la cota de diseño Z_dis es:
 *
 *          h  = Z_terr − Z_dis            (altura respecto al plano de diseño)
 *          V  = h · area_celda
 *          h > 0  →  CORTE   (terreno por encima del diseño, hay que excavar)
 *          h < 0  →  RELLENO (terreno por debajo del diseño, hay que rellenar)
 *
 *      La cota de diseño admite un plano inclinado opcional (gradiente en X e Y),
 *      dejando la puerta abierta a rampas / plataformas con pendiente.
 *
 * ADVERTENCIA DE PRECISIÓN: malla + IDW es una ESTIMACIÓN. La exactitud depende
 * directamente de la densidad y distribución de los puntos: zonas sin puntos se
 * interpolan y pueden desviarse del terreno real. No sustituye una triangulación
 * (TIN) ni un levantamiento denso. Ver `warnings` en el resultado.
 *
 * Todas las funciones son PURAS y tipadas — sin estado, sin efectos.
 */

export interface TopoPoint {
  x: number
  y: number
  z: number
}

/** Cota de diseño: plano horizontal (z0) u opcionalmente inclinado (gradientes). */
export interface DesignPlane {
  /** Cota base del plano en el origen del cálculo (msnm o relativa). */
  z0: number
  /** Pendiente en X (Δz por unidad de X). 0 = horizontal. */
  slopeX?: number
  /** Pendiente en Y (Δz por unidad de Y). 0 = horizontal. */
  slopeY?: number
}

export interface CubicacionOptions {
  /** Lado de la celda de la malla (unidades del levantamiento, normalmente m). */
  cellSize?: number
  /** Potencia del IDW. 2 = estándar. */
  power?: number
  /** Radio de búsqueda IDW. Por defecto adaptativo (~2.5 × cellSize). */
  searchRadius?: number
}

export interface CubicacionResult {
  cutVolume: number       // m³ de corte  (terreno sobre diseño)
  fillVolume: number      // m³ de relleno (terreno bajo diseño)
  netVolume: number       // corte − relleno (positivo = sobra material)
  area: number            // m² de la huella cubicada (celdas con dato)
  pointsUsed: number      // puntos válidos del levantamiento
  cellSize: number        // lado de celda efectivo
  cellsEvaluated: number  // celdas con al menos un punto en su radio
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
  warnings: string[]      // advertencias honestas de precisión / datos
}

/** Bounding box de una nube de puntos. Lanza si el arreglo está vacío. */
export function boundingBox(points: TopoPoint[]) {
  if (points.length === 0) throw new Error("No hay puntos para cubicar.")
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

/**
 * Tamaño de celda por defecto según densidad: se busca ~1 punto por celda,
 * de modo que la resolución acompañe al detalle real del levantamiento.
 *   cell ≈ sqrt(area_bbox / n_puntos), acotado a [0.5, 50] y redondeado.
 */
export function defaultCellSize(points: TopoPoint[]): number {
  const b = boundingBox(points)
  const w = Math.max(b.maxX - b.minX, 1e-6)
  const h = Math.max(b.maxY - b.minY, 1e-6)
  const areaPerPoint = (w * h) / Math.max(points.length, 1)
  const raw = Math.sqrt(areaPerPoint)
  const clamped = Math.min(Math.max(raw, 0.5), 50)
  // redondeo "amable" a 1 cifra significativa razonable
  return Math.round(clamped * 100) / 100
}

/** Cota de diseño en un punto (x,y) según el plano (horizontal o inclinado). */
export function designElevation(plane: DesignPlane, x: number, y: number, ox: number, oy: number): number {
  return plane.z0 + (plane.slopeX ?? 0) * (x - ox) + (plane.slopeY ?? 0) * (y - oy)
}

/**
 * Interpolación IDW de la cota en (x,y) usando los puntos dentro de `radius`.
 * Devuelve null si no hay puntos en el radio (celda sin dato).
 */
export function idwElevation(
  points: TopoPoint[],
  x: number,
  y: number,
  radius: number,
  power: number,
): number | null {
  let num = 0
  let den = 0
  let used = 0
  const r2 = radius * radius
  for (const p of points) {
    const dx = p.x - x
    const dy = p.y - y
    const d2 = dx * dx + dy * dy
    if (d2 > r2) continue
    if (d2 < 1e-9) return p.z // el centro coincide con un punto medido
    const w = 1 / Math.pow(Math.sqrt(d2), power)
    num += p.z * w
    den += w
    used++
  }
  return used > 0 ? num / den : null
}

/**
 * Cubicación completa corte/relleno de la nube `points` contra el plano `design`.
 * Funciones puras: no muta las entradas.
 */
export function cubicar(
  points: TopoPoint[],
  design: DesignPlane,
  opts: CubicacionOptions = {},
): CubicacionResult {
  const valid = points.filter(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z),
  )
  const warnings: string[] = []
  if (valid.length < points.length) {
    warnings.push(`Se descartaron ${points.length - valid.length} punto(s) con coordenadas inválidas.`)
  }
  if (valid.length < 3) {
    throw new Error("Se requieren al menos 3 puntos válidos para cubicar.")
  }

  const cellSize = opts.cellSize && opts.cellSize > 0 ? opts.cellSize : defaultCellSize(valid)
  const power = opts.power && opts.power > 0 ? opts.power : 2
  const radius = opts.searchRadius && opts.searchRadius > 0 ? opts.searchRadius : cellSize * 2.5

  const b = boundingBox(valid)
  const width = b.maxX - b.minX
  const height = b.maxY - b.minY
  const nx = Math.max(1, Math.ceil(width / cellSize))
  const ny = Math.max(1, Math.ceil(height / cellSize))
  const cellArea = cellSize * cellSize

  let cutVolume = 0
  let fillVolume = 0
  let cellsEvaluated = 0

  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      // centro de celda
      const cx = b.minX + (ix + 0.5) * cellSize
      const cy = b.minY + (iy + 0.5) * cellSize
      const zTerr = idwElevation(valid, cx, cy, radius, power)
      if (zTerr === null) continue // celda fuera del alcance de los puntos
      const zDes = designElevation(design, cx, cy, b.minX, b.minY)
      const h = zTerr - zDes
      const v = h * cellArea
      if (h > 0) cutVolume += v
      else fillVolume += -v
      cellsEvaluated++
    }
  }

  const area = cellsEvaluated * cellArea
  const coverage = cellsEvaluated / (nx * ny)

  warnings.push(
    "Estimación por malla regular + IDW (potencia " +
      power +
      "). La precisión depende de la densidad de puntos; no reemplaza una triangulación (TIN).",
  )
  if (valid.length < 15) {
    warnings.push(`Densidad baja (${valid.length} puntos): resultado orientativo.`)
  }
  if (coverage < 0.6) {
    warnings.push(
      `Cobertura de malla ${(coverage * 100).toFixed(0)}%: hay zonas sin puntos cercanos que quedaron fuera del cálculo.`,
    )
  }

  return {
    cutVolume,
    fillVolume,
    netVolume: cutVolume - fillVolume,
    area,
    pointsUsed: valid.length,
    cellSize,
    cellsEvaluated,
    bbox: b,
    warnings,
  }
}

/* ── Autoverificación (no la usa la página; ejecutable con node/tsx) ──────────
 * Casos con valores conocidos a mano. Devuelve {ok, results[]}.
 */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // Caso 1: 4 puntos planos a cota 100 formando un cuadrado 10×10.
  // Diseño horizontal z=99 → todo el terreno está 1 m por encima ⇒ sólo CORTE,
  // relleno = 0. Corte ≈ área × 1 m. Área ≈ 100 m² (con celda que cubra el cuadrado).
  {
    const sq: TopoPoint[] = [
      { x: 0, y: 0, z: 100 },
      { x: 10, y: 0, z: 100 },
      { x: 0, y: 10, z: 100 },
      { x: 10, y: 10, z: 100 },
    ]
    const r = cubicar(sq, { z0: 99 }, { cellSize: 2, searchRadius: 30 })
    const ok =
      near(r.fillVolume, 0, 1e-6) &&
      near(r.cutVolume, r.area * 1, 1e-6) &&
      near(r.area, 100, 1) // 5×5 celdas de 2 m = 100 m²
    results.push({
      name: "plano z=100 vs diseño 99 → relleno 0, corte=área×1",
      ok,
      detail: `corte=${r.cutVolume.toFixed(2)} relleno=${r.fillVolume.toFixed(2)} área=${r.area.toFixed(2)}`,
    })
  }

  // Caso 2: mismo plano, diseño IGUAL a la cota (z=100) ⇒ corte 0 y relleno 0.
  {
    const sq: TopoPoint[] = [
      { x: 0, y: 0, z: 100 },
      { x: 10, y: 0, z: 100 },
      { x: 0, y: 10, z: 100 },
      { x: 10, y: 10, z: 100 },
    ]
    const r = cubicar(sq, { z0: 100 }, { cellSize: 2, searchRadius: 30 })
    const ok = near(r.cutVolume, 0, 1e-6) && near(r.fillVolume, 0, 1e-6)
    results.push({
      name: "plano z=100 vs diseño 100 → corte 0 y relleno 0",
      ok,
      detail: `corte=${r.cutVolume.toFixed(2)} relleno=${r.fillVolume.toFixed(2)}`,
    })
  }

  // Caso 3: plano z=100, diseño z=101 (1 m por encima del terreno) ⇒ sólo RELLENO
  // = área × 1, corte 0.
  {
    const sq: TopoPoint[] = [
      { x: 0, y: 0, z: 100 },
      { x: 10, y: 0, z: 100 },
      { x: 0, y: 10, z: 100 },
      { x: 10, y: 10, z: 100 },
    ]
    const r = cubicar(sq, { z0: 101 }, { cellSize: 2, searchRadius: 30 })
    const ok = near(r.cutVolume, 0, 1e-6) && near(r.fillVolume, r.area * 1, 1e-6)
    results.push({
      name: "plano z=100 vs diseño 101 → corte 0, relleno=área×1",
      ok,
      detail: `corte=${r.cutVolume.toFixed(2)} relleno=${r.fillVolume.toFixed(2)} área=${r.area.toFixed(2)}`,
    })
  }

  return { ok: results.every((r) => r.ok), results }
}
