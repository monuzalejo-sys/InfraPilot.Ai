/* Poligonal CERRADA — compensación completa (levantamiento por ángulos internos).
 *
 * Módulo MODELO del resto de ingenierías: cada paso queda documentado con su
 * fórmula para poder auditar el cálculo a mano. Todas las funciones son PURAS.
 *
 * Convención: recorrido de la poligonal en sentido HORARIO, con ángulos
 * INTERNOS observados en cada vértice. Azimuts medidos desde el Norte, sentido
 * horario, en el rango [0°, 360°). Ejes: E = Este (X), N = Norte (Y).
 *
 * ── (a) Error de cierre ANGULAR ───────────────────────────────────────────
 *   La suma teórica de los ángulos internos de un polígono de n lados es:
 *
 *        Σθ_teórica = (n − 2) · 180°
 *
 *   El error angular es la diferencia con lo observado:
 *
 *        Eα = Σθ_observada − (n − 2)·180°
 *
 *   Se reparte por igual entre los n vértices (compensación equitativa):
 *
 *        c_θ = −Eα / n      →     θ_comp = θ_obs + c_θ
 *
 * ── (b) Azimuts CORRIDOS ──────────────────────────────────────────────────
 *   Partiendo del azimut inicial Az₀ del primer lado, con ángulos internos y
 *   recorrido horario, el azimut del lado siguiente se obtiene con:
 *
 *        Az_i = Az_(i−1) + 180° − θ_comp,i     (mód 360°)
 *
 *   (regla del ángulo interno; el término 180° invierte el sentido del lado
 *   anterior y se resta el ángulo interior del vértice).
 *
 * ── (c) PROYECCIONES de cada lado ─────────────────────────────────────────
 *        ΔE = d · sen(Az)        (proyección Este  / departure)
 *        ΔN = d · cos(Az)        (proyección Norte / latitude)
 *
 * ── (d) Error de cierre LINEAL ────────────────────────────────────────────
 *   En una poligonal cerrada ΣΔE y ΣΔN deben ser 0. Los residuos son:
 *
 *        εE = ΣΔE        εN = ΣΔN
 *        ε  = √(εE² + εN²)                (error lineal total)
 *        Precisión relativa = 1 / (Σd / ε)     →   se reporta como 1/X
 *
 * ── (e) COMPENSACIÓN por MÉTODO DE LA BRÚJULA (Bowditch) ───────────────────
 *   Reparte los residuos proporcionalmente a la longitud de cada lado:
 *
 *        cΔE_i = −εE · (d_i / Σd)        cΔN_i = −εN · (d_i / Σd)
 *        ΔE_comp = ΔE + cΔE             ΔN_comp = ΔN + cΔN
 *
 * ── (f) COORDENADAS compensadas ───────────────────────────────────────────
 *   Acumulando desde la estación de partida (E₀, N₀):
 *
 *        E_i = E_(i−1) + ΔE_comp,i       N_i = N_(i−1) + ΔN_comp,i
 *
 *   Al ser cerrada, la última coordenada vuelve exactamente a (E₀, N₀).
 *
 * ── (g) ÁREA por coordenadas (fórmula de Gauss / del zapatero) ─────────────
 *        2A = Σ ( E_i · N_(i+1) − E_(i+1) · N_i )
 *        A  = |2A| / 2
 *
 * ── TOLERANCIA angular ────────────────────────────────────────────────────
 *   Tolerancia clásica dependiente del nº de vértices:
 *
 *        T = ±a · √n     (a en segundos, default a = 30")
 *
 *   con veredicto |Eα| ≤ T dentro / fuera.
 */

/** Unidad del ángulo interno observado. */
export type AngleUnit = "deg" | "gon"

export interface PolyStation {
  /** Nombre del vértice (E-1, E-2…). */
  name: string
  /** Ángulo interno observado, en la unidad indicada por `angleUnit`. */
  angle: number
  /** Longitud del lado que SALE de este vértice hacia el siguiente (m). */
  distance: number
}

export interface PoligonalInput {
  /** Vértices de la poligonal cerrada, en orden de recorrido (horario). */
  stations: PolyStation[]
  /** Azimut del primer lado (E-1 → E-2), en grados sexagesimales decimales. */
  initialAzimuth: number
  /** Coordenadas de la estación de partida. */
  startEast: number
  startNorth: number
  /** Unidad de los ángulos internos observados (default "deg"). */
  angleUnit?: AngleUnit
  /** Coef. tolerancia angular a en segundos (default 30 → T = ±30″·√n). */
  toleranceSec?: number
}

export interface PolyRow {
  /** Vértice donde se mide el ángulo. */
  name: string
  /** Ángulo interno observado (grados decimales, ya normalizado a deg). */
  angleObserved: number
  /** Ángulo interno compensado (grados decimales). */
  angleAdjusted: number
  /** Azimut del lado que sale de este vértice (grados decimales). */
  azimuth: number
  /** Longitud del lado (m). */
  distance: number
  /** Proyección Este cruda ΔE = d·sen(Az). */
  deltaE: number
  /** Proyección Norte cruda ΔN = d·cos(Az). */
  deltaN: number
  /** Corrección Bowditch en E. */
  correctionE: number
  /** Corrección Bowditch en N. */
  correctionN: number
  /** Coordenada Este compensada del vértice. */
  east: number
  /** Coordenada Norte compensada del vértice. */
  north: number
}

export interface PoligonalResult {
  rows: PolyRow[]
  n: number
  /** Σ ángulos internos observados (grados decimales). */
  sumAnglesObserved: number
  /** Σ teórica (n−2)·180°. */
  sumAnglesTheoretical: number
  /** Error angular Eα (grados decimales). */
  angularError: number
  /** Error angular en segundos de arco. */
  angularErrorSec: number
  /** Tolerancia angular T = a·√n (segundos). */
  toleranceSec: number
  /** |Eα| ≤ T. */
  angularWithinTolerance: boolean
  /** Corrección angular por vértice (segundos). */
  angularCorrectionPerStation: number
  /** Residuo lineal en E (m). */
  closureE: number
  /** Residuo lineal en N (m). */
  closureN: number
  /** Error lineal total ε (m). */
  linearError: number
  /** Perímetro Σd (m). */
  perimeter: number
  /** Denominador X de la precisión relativa 1/X (Σd / ε). Infinity si ε=0. */
  relativePrecision: number
  /** Área por coordenadas (m²). */
  area: number
  warnings: string[]
}

// ── Utilidades angulares ────────────────────────────────────────────────────
const DEG = Math.PI / 180
const sinDeg = (deg: number) => Math.sin(deg * DEG)
const cosDeg = (deg: number) => Math.cos(deg * DEG)
/** Normaliza un ángulo a [0, 360). */
const norm360 = (deg: number) => ((deg % 360) + 360) % 360
/** gon (grados centesimales, 400 en la circunferencia) → grados sexagesimales. */
const gonToDeg = (gon: number) => (gon * 360) / 400

/**
 * Calcula una poligonal cerrada completa: cierre angular y compensación,
 * azimuts corridos, proyecciones, cierre lineal, compensación Bowditch,
 * coordenadas compensadas y área por coordenadas. Función pura.
 */
export function calcularPoligonal(input: PoligonalInput): PoligonalResult {
  const { initialAzimuth, startEast, startNorth } = input
  const unit: AngleUnit = input.angleUnit ?? "deg"
  const a = input.toleranceSec && input.toleranceSec > 0 ? input.toleranceSec : 30
  const warnings: string[] = []

  const stations = input.stations ?? []
  const n = stations.length
  if (n < 3) {
    throw new Error("Una poligonal cerrada requiere al menos 3 vértices.")
  }

  // Ángulos internos observados normalizados a grados sexagesimales decimales.
  const anglesDeg = stations.map((s) =>
    unit === "gon" ? gonToDeg(s.angle) : s.angle,
  )
  const distances = stations.map((s) => (Number.isFinite(s.distance) ? s.distance : 0))
  if (distances.some((d) => d <= 0)) {
    warnings.push("Hay lados con longitud ≤ 0; revisa las distancias de la poligonal.")
  }

  // ── (a) Cierre angular y compensación equitativa ──────────────────────────
  const sumAnglesObserved = anglesDeg.reduce((s, v) => s + v, 0)
  const sumAnglesTheoretical = (n - 2) * 180
  const angularError = sumAnglesObserved - sumAnglesTheoretical // Eα
  const angularErrorSec = angularError * 3600
  const toleranceSec = a * Math.sqrt(n)
  const angularWithinTolerance = Math.abs(angularErrorSec) <= toleranceSec

  // Reparto equitativo: c_θ = −Eα / n (en grados) a cada vértice.
  const angularCorrectionDeg = -angularError / n
  const angularCorrectionPerStation = angularCorrectionDeg * 3600 // en segundos
  const anglesAdjusted = anglesDeg.map((v) => v + angularCorrectionDeg)

  if (!angularWithinTolerance) {
    warnings.push(
      `Cierre angular ${angularErrorSec.toFixed(1)}″ supera la tolerancia ±${toleranceSec.toFixed(1)}″ (±${a}″·√${n}): revisar ángulos antes de compensar.`,
    )
  }

  // ── (b) Azimuts corridos con ángulos internos compensados ─────────────────
  // Az_1 = Az₀ (lado E-1 → E-2). Az_i = Az_(i−1) + 180° − θ_comp,i (mód 360).
  // El ángulo del vértice i cierra el lado que llega a i y arranca el siguiente,
  // por eso el azimut del lado i (i≥2) usa el ángulo interno del vértice i.
  const azimuths: number[] = new Array(n)
  azimuths[0] = norm360(initialAzimuth)
  for (let i = 1; i < n; i++) {
    azimuths[i] = norm360(azimuths[i - 1] + 180 - anglesAdjusted[i])
  }

  // ── (c) Proyecciones ΔE = d·sen(Az), ΔN = d·cos(Az) ───────────────────────
  const deltaE = azimuths.map((az, i) => distances[i] * sinDeg(az))
  const deltaN = azimuths.map((az, i) => distances[i] * cosDeg(az))

  // ── (d) Error de cierre lineal ────────────────────────────────────────────
  const closureE = deltaE.reduce((s, v) => s + v, 0) // εE
  const closureN = deltaN.reduce((s, v) => s + v, 0) // εN
  const linearError = Math.hypot(closureE, closureN) // ε
  const perimeter = distances.reduce((s, v) => s + v, 0)
  const relativePrecision = linearError > 1e-12 ? perimeter / linearError : Infinity

  // ── (e) Compensación Bowditch (proporcional a longitudes) ─────────────────
  const correctionE = distances.map((d) =>
    perimeter > 0 ? -closureE * (d / perimeter) : 0,
  )
  const correctionN = distances.map((d) =>
    perimeter > 0 ? -closureN * (d / perimeter) : 0,
  )

  // ── (f) Coordenadas compensadas (acumuladas desde la partida) ─────────────
  // La fila i lleva el lado que SALE del vértice i; su coordenada es la del
  // propio vértice i (punto de partida del lado). El último lado cierra en E₀,N₀.
  const rows: PolyRow[] = []
  let e = startEast
  let north = startNorth
  for (let i = 0; i < n; i++) {
    rows.push({
      name: stations[i].name || `E-${i + 1}`,
      angleObserved: anglesDeg[i],
      angleAdjusted: anglesAdjusted[i],
      azimuth: azimuths[i],
      distance: distances[i],
      deltaE: deltaE[i],
      deltaN: deltaN[i],
      correctionE: correctionE[i],
      correctionN: correctionN[i],
      east: e,
      north,
    })
    // Avance al vértice siguiente con la proyección compensada.
    e = e + deltaE[i] + correctionE[i]
    north = north + deltaN[i] + correctionN[i]
  }

  // ── (g) Área por coordenadas (Gauss / shoelace) sobre coords compensadas ──
  let cross = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    cross += rows[i].east * rows[j].north - rows[j].east * rows[i].north
  }
  const area = Math.abs(cross) / 2

  return {
    rows,
    n,
    sumAnglesObserved,
    sumAnglesTheoretical,
    angularError,
    angularErrorSec,
    toleranceSec,
    angularWithinTolerance,
    angularCorrectionPerStation,
    closureE,
    closureN,
    linearError,
    perimeter,
    relativePrecision,
    area,
    warnings,
  }
}

/* ── Autoverificación (no la usa la página) ──────────────────────────────── */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // Caso 1: CUADRADO PERFECTO 100×100 calculable a mano.
  // Ángulos internos 90° en los 4 vértices → Σ=360=(4−2)·180, Eα=0.
  // Az₀=90° (primer lado hacia el Este). Con la regla Az_i = Az_(i−1)+180−90:
  //   Az1=90 (E), Az2=180 (S), Az3=270 (W), Az4=360→0 (N). Recorre el cuadrado.
  // ΔE/ΔN cierran exactamente → ε=0, área=100·100=10000.
  {
    const r = calcularPoligonal({
      stations: [
        { name: "E-1", angle: 90, distance: 100 },
        { name: "E-2", angle: 90, distance: 100 },
        { name: "E-3", angle: 90, distance: 100 },
        { name: "E-4", angle: 90, distance: 100 },
      ],
      initialAzimuth: 90,
      startEast: 1000,
      startNorth: 1000,
    })
    const ok =
      near(r.angularError, 0, 1e-9) &&
      r.angularWithinTolerance &&
      near(r.linearError, 0, 1e-6) &&
      near(r.area, 10000, 1e-3) &&
      near(r.rows[1].east, 1100, 1e-6) && near(r.rows[1].north, 1000, 1e-6) &&
      near(r.rows[2].east, 1100, 1e-6) && near(r.rows[2].north, 900, 1e-6) &&
      near(r.rows[3].east, 1000, 1e-6) && near(r.rows[3].north, 900, 1e-6)
    results.push({
      name: "cuadrado 100×100: Eα=0, ε=0, área=10000, coords exactas",
      ok,
      detail: `Eα=${r.angularErrorSec.toFixed(2)}″ ε=${r.linearError.toExponential(2)} área=${r.area.toFixed(2)} Az=[${r.rows.map((x) => x.azimuth.toFixed(0)).join(",")}]`,
    })
  }

  // Caso 2: cuadrado con error angular PEQUEÑO compensable (+40″ repartidos).
  // Cada ángulo 90° + 10″ → Σ excede en 40″. T = 30·√4 = 60″ → dentro.
  // La compensación resta 10″ por vértice y el cierre lineal queda ínfimo.
  {
    const off = 10 / 3600 // 10 segundos en grados
    const r = calcularPoligonal({
      stations: [
        { name: "E-1", angle: 90 + off, distance: 100 },
        { name: "E-2", angle: 90 + off, distance: 100 },
        { name: "E-3", angle: 90 + off, distance: 100 },
        { name: "E-4", angle: 90 + off, distance: 100 },
      ],
      initialAzimuth: 90,
      startEast: 0,
      startNorth: 0,
    })
    const sumAdj = r.rows.reduce((s, x) => s + x.angleAdjusted, 0)
    const ok =
      near(r.angularErrorSec, 40, 1e-3) &&
      near(r.toleranceSec, 60, 1e-9) &&
      r.angularWithinTolerance &&
      near(r.angularCorrectionPerStation, -10, 1e-6) &&
      near(sumAdj, 360, 1e-9) && // Σ compensada = teórica exacta
      // última coordenada compensada regresa a la partida (0,0)
      near(r.rows[0].east, 0, 1e-9) && near(r.rows[0].north, 0, 1e-9)
    results.push({
      name: "error +40″ (<T=60″) → compensa −10″/vértice, Σ=360, cierra en partida",
      ok,
      detail: `Eα=${r.angularErrorSec.toFixed(1)}″ T=${r.toleranceSec.toFixed(1)}″ Σadj=${sumAdj.toFixed(6)} corr/vtx=${r.angularCorrectionPerStation.toFixed(2)}″`,
    })
  }

  // Caso 3: soporte de gon (centesimal). 100 gon = 90°. Mismo cuadrado.
  {
    const r = calcularPoligonal({
      stations: [
        { name: "E-1", angle: 100, distance: 50 },
        { name: "E-2", angle: 100, distance: 50 },
        { name: "E-3", angle: 100, distance: 50 },
        { name: "E-4", angle: 100, distance: 50 },
      ],
      initialAzimuth: 90,
      startEast: 0,
      startNorth: 0,
      angleUnit: "gon",
    })
    const ok =
      near(r.angularError, 0, 1e-9) &&
      near(r.area, 2500, 1e-3) &&
      near(r.rows[0].angleObserved, 90, 1e-9) // convertido a deg
    results.push({
      name: "gon: 100gon=90°, cuadrado 50×50 → área=2500",
      ok,
      detail: `θ1=${r.rows[0].angleObserved}° área=${r.area.toFixed(2)} 1/X=${r.relativePrecision === Infinity ? "∞" : r.relativePrecision.toFixed(0)}`,
    })
  }

  return { ok: results.every((r) => r.ok), results }
}
