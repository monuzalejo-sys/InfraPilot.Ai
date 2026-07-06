/* Estimación de proyectos de software.
 *
 * Dos métodos independientes que conviven en el mismo módulo:
 *
 * 1) ESTIMACIÓN POR FASES Y ROLES (bottom-up):
 *    Cada fase tiene asignaciones de horas por rol. El costo directo de una
 *    fase es la suma de (horas × tarifaHora) de sus asignaciones. Sobre el
 *    total directo del proyecto se aplican dos recargos porcentuales:
 *
 *      Contingencia (imprevistos/retrabajos):  Contingencia = Directo × contingenciaPct
 *      Overhead (gestión, soporte, licencias):  Overhead     = Directo × overheadPct
 *      TOTAL = Directo + Contingencia + Overhead
 *
 *    Por defecto contingenciaPct = 0.15 (15%) y overheadPct = 0.10 (10%),
 *    valores típicos de referencia en estimación de proyectos TI.
 *
 * 2) ESTIMACIÓN POR PUNTOS DE FUNCIÓN (IFPUG simplificado):
 *    Se cuentan 5 tipos de componentes funcionales y cada uno se pondera por
 *    un peso medio estándar (complejidad "promedio" de la tabla IFPUG):
 *
 *      Entradas externas (EI):        peso 4
 *      Salidas externas (EO):         peso 5
 *      Consultas externas (EQ):       peso 4
 *      Archivos lógicos internos (ILF): peso 10
 *      Interfaces externas (EIF):     peso 7
 *
 *    Puntos de función sin ajustar:
 *      PF = EI×4 + EO×5 + EQ×4 + ILF×10 + EIF×7
 *
 *    Puntos de función ajustados (factor de ajuste por complejidad técnica
 *    del proyecto; en IFPUG completo sale de 14 características generales,
 *    aquí se recibe directo como parámetro, rango típico 0.65–1.35):
 *      PFA = PF × factorAjuste   (factorAjuste default 1.0 = sin ajuste)
 *
 *    Horas estimadas:
 *      Horas = PFA × horasPorPF   (horasPorPF default 8 h/PF, productividad
 *      de referencia; ajustar según datos históricos del equipo)
 *
 *    Costo: Horas × tarifaPromedio (tarifa promedio de los roles provistos,
 *    o la tarifa indicada explícitamente).
 *
 * Todas las funciones son PURAS y tipadas. Sin estado, sin dependencias de
 * React/Next.
 */

export interface Rol {
  id: string
  nombre: string
  /** Tarifa por hora en la moneda del proyecto. */
  tarifaHora: number
}

export interface AsignacionRol {
  rolId: string
  horas: number
}

export interface FaseProyecto {
  id: string
  nombre: string
  asignaciones: AsignacionRol[]
}

export interface ParamsEstimacion {
  fases: FaseProyecto[]
  roles: Rol[]
  /** % de contingencia sobre el directo (default 0.15 = 15%). */
  contingenciaPct?: number
  /** % de overhead sobre el directo (default 0.10 = 10%). */
  overheadPct?: number
}

export interface FaseCalculada {
  id: string
  nombre: string
  horas: number
  subtotal: number
}

export interface EstimacionResult {
  fases: FaseCalculada[]
  horasTotalesPorRol: { rolId: string; nombre: string; horas: number; costo: number }[]
  horasTotales: number
  totalDirecto: number
  contingenciaPct: number
  contingencia: number
  overheadPct: number
  overhead: number
  total: number
}

export interface ConteosPF {
  entradasExternas: number
  salidasExternas: number
  consultas: number
  archivosLogicos: number
  interfaces: number
}

export interface ParamsPuntosFuncion {
  conteos: ConteosPF
  /** Factor de ajuste técnico (rango típico 0.65–1.35). Default 1.0. */
  factorAjuste?: number
  /** Horas por punto de función ajustado (productividad). Default 8. */
  horasPorPF?: number
  /** Tarifa promedio por hora para convertir horas a costo. */
  tarifaPromedioHora?: number
}

export interface PuntosFuncionResult {
  pf: number
  pfAjustados: number
  factorAjuste: number
  horasPorPF: number
  horasEstimadas: number
  costoEstimado: number | null
}

/** Pesos medios estándar IFPUG por tipo de componente funcional. */
export const PESOS_PF = {
  entradasExternas: 4,
  salidasExternas: 5,
  consultas: 4,
  archivosLogicos: 10,
  interfaces: 7,
} as const

/** Redondeo a 2 decimales para presentación (no usar en cálculos intermedios). */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * Calcula la estimación de un proyecto por fases y roles: subtotal por fase,
 * total directo, contingencia, overhead, total final y horas totales por rol.
 * Función pura.
 */
export function calcularEstimacion(params: ParamsEstimacion): EstimacionResult {
  const { fases, roles } = params
  const contingenciaPct = params.contingenciaPct ?? 0.15
  const overheadPct = params.overheadPct ?? 0.1

  const tarifaPorRol = new Map(roles.map((r) => [r.id, r.tarifaHora]))
  const nombrePorRol = new Map(roles.map((r) => [r.id, r.nombre]))

  const horasPorRolMap = new Map<string, number>()

  const fasesCalculadas: FaseCalculada[] = fases.map((fase) => {
    let horasFase = 0
    let subtotalFase = 0
    for (const asign of fase.asignaciones) {
      const tarifa = tarifaPorRol.get(asign.rolId) ?? 0
      horasFase += asign.horas
      subtotalFase += asign.horas * tarifa
      horasPorRolMap.set(asign.rolId, (horasPorRolMap.get(asign.rolId) ?? 0) + asign.horas)
    }
    return {
      id: fase.id,
      nombre: fase.nombre,
      horas: horasFase,
      subtotal: subtotalFase,
    }
  })

  const horasTotales = fasesCalculadas.reduce((acc, f) => acc + f.horas, 0)
  const totalDirecto = fasesCalculadas.reduce((acc, f) => acc + f.subtotal, 0)
  const contingencia = totalDirecto * contingenciaPct
  const overhead = totalDirecto * overheadPct
  const total = totalDirecto + contingencia + overhead

  const horasTotalesPorRol = roles.map((r) => {
    const horas = horasPorRolMap.get(r.id) ?? 0
    return {
      rolId: r.id,
      nombre: nombrePorRol.get(r.id) ?? r.id,
      horas,
      costo: horas * r.tarifaHora,
    }
  })

  return {
    fases: fasesCalculadas,
    horasTotalesPorRol,
    horasTotales,
    totalDirecto,
    contingenciaPct,
    contingencia,
    overheadPct,
    overhead,
    total,
  }
}

/**
 * Calcula puntos de función IFPUG simplificados (sin ajustar y ajustados),
 * las horas estimadas y, si se da tarifa promedio, el costo estimado.
 * Función pura.
 */
export function calcularPuntosFuncion(params: ParamsPuntosFuncion): PuntosFuncionResult {
  const { conteos } = params
  const factorAjuste = params.factorAjuste ?? 1.0
  const horasPorPF = params.horasPorPF ?? 8

  const pf =
    conteos.entradasExternas * PESOS_PF.entradasExternas +
    conteos.salidasExternas * PESOS_PF.salidasExternas +
    conteos.consultas * PESOS_PF.consultas +
    conteos.archivosLogicos * PESOS_PF.archivosLogicos +
    conteos.interfaces * PESOS_PF.interfaces

  const pfAjustados = pf * factorAjuste
  const horasEstimadas = pfAjustados * horasPorPF
  const costoEstimado =
    params.tarifaPromedioHora !== undefined ? horasEstimadas * params.tarifaPromedioHora : null

  return {
    pf,
    pfAjustados,
    factorAjuste,
    horasPorPF,
    horasEstimadas,
    costoEstimado,
  }
}

/* ── Autoverificación (no la usa la página) ──────────────────────────────── */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // Caso 1: 1 fase, 1 rol, 100 hh × $10/h = 1000 directo.
  // +15% contingencia = 150. +10% overhead = 100. TOTAL = 1000+150+100 = 1250.
  {
    const r = calcularEstimacion({
      fases: [{ id: "f1", nombre: "Desarrollo", asignaciones: [{ rolId: "dev", horas: 100 }] }],
      roles: [{ id: "dev", nombre: "Desarrollador", tarifaHora: 10 }],
    })
    const ok =
      near(r.totalDirecto, 1000, 1e-9) &&
      near(r.contingencia, 150, 1e-9) &&
      near(r.overhead, 100, 1e-9) &&
      near(r.total, 1250, 1e-9) &&
      near(r.horasTotales, 100, 1e-9)
    results.push({
      name: "1 fase/1 rol 100hh×$10 +15%conting +10%overhead → 1250",
      ok,
      detail: `directo=${r.totalDirecto} conting=${r.contingencia} overhead=${r.overhead} total=${r.total}`,
    })
  }

  // Caso 2: 2 fases, 2 roles, pcts explícitos distintos de 0 para variar el ejemplo.
  // Fase A: dev 50h×$20=1000, qa 20h×$15=300 → subtotal 1300.
  // Fase B: dev 30h×$20=600 → subtotal 600.
  // Directo = 1900. Horas dev=80, qa=20.
  {
    const r = calcularEstimacion({
      fases: [
        {
          id: "a",
          nombre: "Análisis",
          asignaciones: [
            { rolId: "dev", horas: 50 },
            { rolId: "qa", horas: 20 },
          ],
        },
        { id: "b", nombre: "Construcción", asignaciones: [{ rolId: "dev", horas: 30 }] },
      ],
      roles: [
        { id: "dev", nombre: "Developer", tarifaHora: 20 },
        { id: "qa", nombre: "QA", tarifaHora: 15 },
      ],
      contingenciaPct: 0.2,
      overheadPct: 0.05,
    })
    const devRol = r.horasTotalesPorRol.find((x) => x.rolId === "dev")!
    const ok =
      near(r.fases[0].subtotal, 1300, 1e-9) &&
      near(r.fases[1].subtotal, 600, 1e-9) &&
      near(r.totalDirecto, 1900, 1e-9) &&
      near(devRol.horas, 80, 1e-9) &&
      near(r.total, 1900 * 1.25, 1e-6)
    results.push({
      name: "2 fases/2 roles con pcts custom (20%/5%) → directo 1900, total 2375",
      ok,
      detail: `subtA=${r.fases[0].subtotal} subtB=${r.fases[1].subtotal} devHoras=${devRol.horas} total=${r.total}`,
    })
  }

  // Caso 3 (PF): conteos conocidos → PF exacto sin ajuste.
  // EI=10×4=40, EO=8×5=40, EQ=5×4=20, ILF=3×10=30, EIF=2×7=14 → PF=144.
  // factorAjuste=1.0 → PFA=144. horasPorPF=8 → horas=1152.
  {
    const r = calcularPuntosFuncion({
      conteos: { entradasExternas: 10, salidasExternas: 8, consultas: 5, archivosLogicos: 3, interfaces: 2 },
    })
    const ok = near(r.pf, 144, 1e-9) && near(r.pfAjustados, 144, 1e-9) && near(r.horasEstimadas, 1152, 1e-9)
    results.push({
      name: "PF conteos (10,8,5,3,2)×(4,5,4,10,7) → PF=144, horas=1152",
      ok,
      detail: `pf=${r.pf} pfAjustados=${r.pfAjustados} horas=${r.horasEstimadas}`,
    })
  }

  // Caso 4 (PF con ajuste y costo): mismo conteo, factorAjuste=1.1, horasPorPF=5, tarifa=$50/h.
  // PFA = 144×1.1 = 158.4. Horas = 158.4×5 = 792. Costo = 792×50 = 39600.
  {
    const r = calcularPuntosFuncion({
      conteos: { entradasExternas: 10, salidasExternas: 8, consultas: 5, archivosLogicos: 3, interfaces: 2 },
      factorAjuste: 1.1,
      horasPorPF: 5,
      tarifaPromedioHora: 50,
    })
    const ok = near(r.pfAjustados, 158.4, 1e-6) && near(r.horasEstimadas, 792, 1e-6) && near(r.costoEstimado ?? -1, 39600, 1e-6)
    results.push({
      name: "PF con factorAjuste=1.1, horasPorPF=5, tarifa=$50 → PFA=158.4, horas=792, costo=39600",
      ok,
      detail: `pfAjustados=${r.pfAjustados} horas=${r.horasEstimadas} costo=${r.costoEstimado}`,
    })
  }

  return { ok: results.every((r) => r.ok), results }
}
