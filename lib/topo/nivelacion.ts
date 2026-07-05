/* Nivelación geométrica cerrada (circuito que regresa al BM de partida).
 *
 * Modelo de libreta de campo por estación:
 *   · VA = Vista Atrás  (back sight, +): lectura a un punto de cota conocida.
 *   · VD = Vista Adelante (fore sight, −): lectura al punto que se transfiere.
 *
 * Fórmulas (nivelación diferencial):
 *
 *   Altura de instrumento:   AI  = Cota_conocida + VA
 *   Cota del punto adelante: Cota = AI − VD
 *
 * Al ser un circuito CERRADO, la última VD debe caer sobre el mismo BM inicial.
 * El desnivel neto teórico es 0, por lo que:
 *
 *   Error de cierre  Ec = ΣVA − ΣVD   (debería ser 0)
 *
 * TOLERANCIA (topografía estándar):   T = ±C · √K
 *   con K = longitud total del circuito en kilómetros y C un coeficiente por
 *   orden de nivelación. Por defecto C = 12 mm (nivelación ordinaria).
 *   Si no hay distancias, K se estima como (nº de armadas / 1000) usando una
 *   longitud media de tramo, o se usa la compensación por nº de armadas.
 *
 * COMPENSACIÓN (reparto del error, signo contrario a Ec):
 *   · Proporcional a la DISTANCIA acumulada:  c_i = −Ec · (Σd_hasta_i / Σd_total)
 *   · Proporcional al Nº DE ARMADAS (si no hay distancias): reparto uniforme
 *     acumulado:  c_i = −Ec · (i / n)
 *
 * Todas las funciones son PURAS y tipadas.
 */

export interface LevelStation {
  /** Nombre del punto (BM, PN1, PN2… o punto de cambio). */
  name: string
  /** Vista atrás (m). El BM inicial suele llevar VA y VD = 0/undefined. */
  backsight?: number
  /** Vista adelante (m). El BM inicial no tiene VD. */
  foresight?: number
  /** Distancia del tramo hasta esta estación (m). Opcional. */
  distance?: number
}

export interface NivelacionInput {
  /** Cota conocida del BM de partida (m). */
  startElevation: number
  /** Estaciones en orden de recorrido; la última cierra sobre el BM inicial. */
  stations: LevelStation[]
  /** Coeficiente de tolerancia C en mm (default 12 → ±12√K mm). */
  toleranceCoef?: number
}

export interface NivelacionRow {
  name: string
  backsight: number | null
  foresight: number | null
  instrumentHeight: number | null // AI = cota + VA
  rawElevation: number            // cota calculada sin compensar
  correction: number              // corrección aplicada (m)
  adjustedElevation: number       // cota compensada
  distance: number | null
  cumulativeDistance: number
}

export interface NivelacionResult {
  rows: NivelacionRow[]
  sumBacksight: number     // ΣVA
  sumForesight: number     // ΣVD
  closureError: number     // Ec = ΣVA − ΣVD (m)
  closureErrorMm: number   // Ec en mm
  totalDistanceKm: number  // K (km)
  tolerance: number        // T en m
  toleranceMm: number      // T en mm
  withinTolerance: boolean // |Ec| ≤ T
  method: "distance" | "setups" // criterio de compensación usado
  warnings: string[]
}

const num = (v: number | undefined): number => (Number.isFinite(v as number) ? (v as number) : 0)

/**
 * Calcula una nivelación cerrada: cotas crudas, error de cierre, tolerancia
 * y cotas compensadas. Función pura.
 */
export function nivelar(input: NivelacionInput): NivelacionResult {
  const { startElevation, stations } = input
  const C = input.toleranceCoef && input.toleranceCoef > 0 ? input.toleranceCoef : 12
  const warnings: string[] = []

  if (!stations || stations.length < 2) {
    throw new Error("Se requieren al menos 2 estaciones (BM inicial + cierre).")
  }

  // ── Paso 1: cotas crudas por el método de altura de instrumento ──────────
  let sumBS = 0
  let sumFS = 0
  let currentElev = startElevation
  let instrumentHeight: number | null = null
  let cumDist = 0

  const hasDistances = stations.some((s) => Number.isFinite(s.distance) && (s.distance as number) > 0)
  const method: "distance" | "setups" = hasDistances ? "distance" : "setups"

  interface Raw {
    name: string
    bs: number | null
    fs: number | null
    ai: number | null
    elev: number
    dist: number | null
    cumDist: number
  }
  const raw: Raw[] = []

  stations.forEach((st, idx) => {
    const bs = Number.isFinite(st.backsight) ? (st.backsight as number) : null
    const fs = Number.isFinite(st.foresight) ? (st.foresight as number) : null
    const dist = Number.isFinite(st.distance) ? (st.distance as number) : null

    // Primera estación = BM conocido; su cota es la de partida.
    if (idx === 0) {
      currentElev = startElevation
    } else if (fs !== null && instrumentHeight !== null) {
      // Cota del punto = AI − VD (usa la AI de la estación anterior con VA).
      currentElev = instrumentHeight - fs
    }

    if (fs !== null) sumFS += fs
    if (dist !== null) {
      cumDist += dist
    }

    // Nueva altura de instrumento si esta estación tiene VA.
    if (bs !== null) {
      instrumentHeight = currentElev + bs
      sumBS += bs
    } else {
      instrumentHeight = idx === 0 ? null : instrumentHeight
    }

    raw.push({
      name: st.name || (idx === 0 ? "BM" : `P${idx}`),
      bs,
      fs,
      ai: bs !== null ? currentElev + bs : null,
      elev: currentElev,
      dist,
      cumDist,
    })
  })

  // ── Paso 2: error de cierre ──────────────────────────────────────────────
  const closureError = sumBS - sumFS // debería ser 0 en circuito cerrado
  const closureErrorMm = closureError * 1000

  // ── Paso 3: tolerancia T = C·√K ─────────────────────────────────────────
  let totalDistanceM = cumDist
  if (!hasDistances) {
    // Sin distancias: estimamos K con nº de armadas (tramos con VD) × 100 m.
    const setups = raw.filter((r) => r.fs !== null).length
    totalDistanceM = setups * 100
    warnings.push("Sin distancias: K estimada por nº de armadas (100 m/tramo) para la tolerancia.")
  }
  const totalDistanceKm = totalDistanceM / 1000
  const toleranceMm = C * Math.sqrt(Math.max(totalDistanceKm, 1e-9))
  const tolerance = toleranceMm / 1000
  const withinTolerance = Math.abs(closureError) <= tolerance

  // ── Paso 4: compensación (reparto acumulado, signo contrario) ────────────
  const totalWeight = method === "distance" ? cumDist : raw.length - 1
  const rows: NivelacionRow[] = raw.map((r, i) => {
    let correction = 0
    // No se corrige el BM inicial (i=0). El reparto acumula hasta el punto i.
    if (i > 0 && totalWeight > 0) {
      const acc = method === "distance" ? r.cumDist : i
      correction = -closureError * (acc / totalWeight)
    }
    // El último punto (cierre sobre BM) recibe la corrección total: su cota
    // ajustada vuelve a la de partida.
    return {
      name: r.name,
      backsight: r.bs,
      foresight: r.fs,
      instrumentHeight: r.ai,
      rawElevation: r.elev,
      correction,
      adjustedElevation: r.elev + correction,
      distance: r.dist,
      cumulativeDistance: r.cumDist,
    }
  })

  if (Math.abs(closureError) > 1e-9 && !withinTolerance) {
    warnings.push(
      `Cierre ${closureErrorMm.toFixed(1)} mm supera la tolerancia ±${toleranceMm.toFixed(1)} mm: revisar libreta antes de compensar.`,
    )
  }

  return {
    rows,
    sumBacksight: sumBS,
    sumForesight: sumFS,
    closureError,
    closureErrorMm,
    totalDistanceKm,
    tolerance,
    toleranceMm,
    withinTolerance,
    method,
    warnings,
  }
}

/* ── Autoverificación (no la usa la página) ──────────────────────────────── */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // Caso 1: circuito PERFECTO que cierra exacto.
  // BM=100. AI=100+1.5=101.5. P1=101.5−0.5=101.0 (VA 2.0 → AI=103.0).
  // Cierre: vuelve a BM con VD=3.0 → 103.0−3.0=100.0. ΣVA=1.5+2.0=3.5, ΣVD=0.5+3.0=3.5.
  // Ec = 0.
  {
    const r = nivelar({
      startElevation: 100,
      stations: [
        { name: "BM", backsight: 1.5, distance: 50 },
        { name: "P1", backsight: 2.0, foresight: 0.5, distance: 50 },
        { name: "BM", foresight: 3.0, distance: 50 },
      ],
    })
    const ok =
      near(r.closureError, 0, 1e-9) &&
      r.withinTolerance &&
      near(r.rows[1].rawElevation, 101.0, 1e-9) &&
      near(r.rows[2].rawElevation, 100.0, 1e-9)
    results.push({
      name: "circuito cerrado exacto → Ec=0, P1=101.0, cierre=100.0",
      ok,
      detail: `Ec=${r.closureErrorMm.toFixed(2)}mm P1=${r.rows[1].rawElevation} fin=${r.rows[2].rawElevation}`,
    })
  }

  // Caso 2: cierre con error de +0.010 m repartido por distancia.
  // Igual que el caso 1 pero VD de cierre = 2.990 → fin cruda = 100.010, Ec=+0.010.
  // Compensación proporcional lleva la cota final de vuelta a 100.000.
  {
    const r = nivelar({
      startElevation: 100,
      stations: [
        { name: "BM", backsight: 1.5, distance: 50 },
        { name: "P1", backsight: 2.0, foresight: 0.5, distance: 50 },
        { name: "BM", foresight: 2.99, distance: 50 },
      ],
    })
    const ok =
      near(r.closureError, 0.01, 1e-6) &&
      near(r.rows[2].adjustedElevation, 100.0, 1e-6) && // cota final compensada
      r.method === "distance"
    results.push({
      name: "error +10mm → compensación por distancia devuelve 100.000",
      ok,
      detail: `Ec=${r.closureErrorMm.toFixed(2)}mm finAjust=${r.rows[2].adjustedElevation.toFixed(4)}`,
    })
  }

  // Caso 3: tolerancia por defecto ±12√K. K=0.15 km → T≈4.65 mm.
  {
    const r = nivelar({
      startElevation: 100,
      stations: [
        { name: "BM", backsight: 1.5, distance: 50 },
        { name: "P1", backsight: 2.0, foresight: 0.5, distance: 50 },
        { name: "BM", foresight: 2.99, distance: 50 },
      ],
    })
    const expected = 12 * Math.sqrt(0.15)
    const ok = near(r.toleranceMm, expected, 1e-6) && !r.withinTolerance // 10mm > 4.65mm
    results.push({
      name: "tolerancia ±12√K con K=0.15km → ~4.65mm, 10mm fuera",
      ok,
      detail: `T=${r.toleranceMm.toFixed(2)}mm dentro=${r.withinTolerance}`,
    })
  }

  return { ok: results.every((r) => r.ok), results }
}
