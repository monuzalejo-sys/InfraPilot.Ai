// Predictor Financiero — Edificio Torre Azul
// Modelo de inversión inmobiliaria a 5 años · 3 escenarios

export type EscenarioKey = "probable" | "conservador" | "critico"

export const proyectoInfo = {
  nombre: "Edificio Torre Azul",
  ubicacion: "Miraflores, Lima, Perú",
  superficie: 6_400,
  pisos: 8,
  sotanos: 2,
  uso: "Oficinas corporativas — primera categoría",
  fechaAnalisis: "Junio 2026",
  moneda: "PEN",
  inversion: {
    terreno:      4_700_000,
    construccion: 10_502_621,
    diseno:         520_000,
    legales:        210_000,
    total:        15_932_621,
  },
}

// ─── Configuración de escenarios ────────────────────────────────
export const SCENARIO_META = {
  probable: {
    key: "probable" as const,
    label: "Probable",
    description: "Condiciones normales del mercado peruano",
    risk: "Moderado",
    color: "#6366f1",
    dotColor: "bg-indigo-500",
    strokeWidth: 2.5,
    bg: "bg-indigo-50",
    activeBg: "bg-indigo-600",
    border: "border-indigo-200",
    activeBorder: "border-indigo-600",
    text: "text-indigo-700",
    activeText: "text-white",
    badge: "bg-indigo-100 text-indigo-700",
    ring: "ring-indigo-500",
    gradient: "from-indigo-600 to-violet-600",
  },
  conservador: {
    key: "conservador" as const,
    label: "Conservador",
    description: "Supuestos cautelosos, crecimiento moderado",
    risk: "Bajo",
    color: "#10b981",
    dotColor: "bg-emerald-500",
    strokeWidth: 1.8,
    bg: "bg-emerald-50",
    activeBg: "bg-emerald-600",
    border: "border-emerald-200",
    activeBorder: "border-emerald-600",
    text: "text-emerald-700",
    activeText: "text-white",
    badge: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
  critico: {
    key: "critico" as const,
    label: "Crítico",
    description: "Recesión + sobrecosto + alta vacancia",
    risk: "Alto",
    color: "#f43f5e",
    dotColor: "bg-rose-500",
    strokeWidth: 1.8,
    bg: "bg-rose-50",
    activeBg: "bg-rose-600",
    border: "border-rose-200",
    activeBorder: "border-rose-600",
    text: "text-rose-700",
    activeText: "text-white",
    badge: "bg-rose-100 text-rose-700",
    ring: "ring-rose-500",
    gradient: "from-rose-500 to-pink-600",
  },
} as const

// ─── Datos financieros por escenario ────────────────────────────
export const ESCENARIOS = {
  probable: {
    supuestos: {
      apreciacionAnual:     6.0,
      vacancia:            10,
      crecimientoArriendo:  4.0,
      costosOperativos:    18,
      wacc:                 8.0,
      sobrecosteObra:       0,
    },
    metricas: {
      van:           14_248_000,
      tir:                27.8,
      paybackAnos:         4.1,
      retornoBruto:       164.3,
      capRate:              9.4,
    },
    valorCompletado:  30_500_000,
    // Valor de mercado año 0–5
    valores:   [30_500_000, 32_330_000, 34_270_000, 36_326_200, 38_505_772, 40_816_118],
    // NOI anual año 1–5
    noi:        [2_880_000,  2_995_200,  3_115_008,  3_239_608,  3_369_192,  3_503_960],
    // NOI acumulado año 1–5
    noiAcum:    [2_880_000,  5_875_200,  8_990_208, 12_229_816, 15_599_008, 19_102_968],
    rentaGruta: 5_120_000,
    vacanciaImporte: 512_000,
    costosOp:   838_000,
  },
  conservador: {
    supuestos: {
      apreciacionAnual:     3.0,
      vacancia:            20,
      crecimientoArriendo:  2.0,
      costosOperativos:    22,
      wacc:                10.0,
      sobrecosteObra:       0,
    },
    metricas: {
      van:            7_280_000,
      tir:                16.4,
      paybackAnos:         5.8,
      retornoBruto:       100.6,
      capRate:              7.0,
    },
    valorCompletado:  27_500_000,
    valores:   [27_500_000, 28_325_000, 29_174_750, 30_050_000, 30_951_500, 31_880_000],
    noi:        [1_920_000,  1_958_400,  1_997_568,  2_037_519,  2_078_270,  2_119_835],
    noiAcum:    [1_920_000,  3_878_400,  5_875_968,  7_913_487,  9_991_757, 12_111_592],
    rentaGruta: 4_608_000,
    vacanciaImporte: 1_024_000,
    costosOp:   739_000,
  },
  critico: {
    supuestos: {
      apreciacionAnual:    -2.0,
      vacancia:            35,
      crecimientoArriendo:  0.0,
      costosOperativos:    28,
      wacc:                12.0,
      sobrecosteObra:      15,
    },
    metricas: {
      van:           -3_124_000,
      tir:                 3.8,
      paybackAnos:          null,
      retornoBruto:        58.0,
      capRate:              4.8,
    },
    valorCompletado:  22_000_000,
    valores:   [22_000_000, 21_560_000, 21_129_000, 20_706_000, 20_292_000, 19_886_000],
    noi:        [1_056_000,  1_056_000,  1_056_000,  1_056_000,  1_056_000,  1_056_000],
    noiAcum:    [1_056_000,  2_112_000,  3_168_000,  4_224_000,  5_280_000,  6_336_000],
    rentaGruta: 3_072_000,
    vacanciaImporte: 1_945_000,
    costosOp:   1_071_000,
    inversionReal: 15_932_621 * 1.15, // +15% overrun
  },
}

// ─── Chart data ─────────────────────────────────────────────────
export const valueChartData = [
  { label: "Inicial", year: 0 },
  { label: "Año 1",   year: 1 },
  { label: "Año 2",   year: 2 },
  { label: "Año 3",   year: 3 },
  { label: "Año 4",   year: 4 },
  { label: "Año 5",   year: 5 },
].map(({ label, year }) => ({
  label,
  probable:     +(ESCENARIOS.probable.valores[year]    / 1_000_000).toFixed(2),
  conservador:  +(ESCENARIOS.conservador.valores[year]  / 1_000_000).toFixed(2),
  critico:      +(ESCENARIOS.critico.valores[year]      / 1_000_000).toFixed(2),
  inversion:    +(proyectoInfo.inversion.total           / 1_000_000).toFixed(2),
}))

export const noiChartData = [1, 2, 3, 4, 5].map((year) => ({
  label: `Año ${year}`,
  probable:    +(ESCENARIOS.probable.noi[year]    / 1_000_000).toFixed(3),
  conservador: +(ESCENARIOS.conservador.noi[year]  / 1_000_000).toFixed(3),
  critico:     +(ESCENARIOS.critico.noi[year]      / 1_000_000).toFixed(3),
}))

export const acumReturnData = [1, 2, 3, 4, 5].map((year) => {
  const pVal = ESCENARIOS.probable.valores[year] - proyectoInfo.inversion.total
  const pNoi = ESCENARIOS.probable.noiAcum[year]

  const cVal = ESCENARIOS.conservador.valores[year] - proyectoInfo.inversion.total
  const cNoi = ESCENARIOS.conservador.noiAcum[year]

  const rVal = ESCENARIOS.critico.valores[year] - proyectoInfo.inversion.total
  const rNoi = ESCENARIOS.critico.noiAcum[year]

  return {
    label: `Año ${year}`,
    probablePlusval: +(pVal / 1_000_000).toFixed(2),
    probableNoi:     +(pNoi / 1_000_000).toFixed(2),
    conservadorPlusval: +(cVal / 1_000_000).toFixed(2),
    conservadorNoi:     +(cNoi / 1_000_000).toFixed(2),
    criticoPlusval: +(Math.max(0, rVal) / 1_000_000).toFixed(2),
    criticoNoi:     +(rNoi / 1_000_000).toFixed(2),
  }
})

// ─── Milestone years (1, 3, 5) ──────────────────────────────────
export const MILESTONES = [1, 3, 5].map((year) => ({
  year,
  label: `${year} año${year > 1 ? "s" : ""}`,
  probable: {
    valor:        ESCENARIOS.probable.valores[year],
    noiAcum:      ESCENARIOS.probable.noiAcum[year],
    retornoTotal: ESCENARIOS.probable.valores[year] + ESCENARIOS.probable.noiAcum[year] - proyectoInfo.inversion.total,
    retornoPct:   +((( ESCENARIOS.probable.valores[year] + ESCENARIOS.probable.noiAcum[year] - proyectoInfo.inversion.total) / proyectoInfo.inversion.total) * 100).toFixed(1),
  },
  conservador: {
    valor:        ESCENARIOS.conservador.valores[year],
    noiAcum:      ESCENARIOS.conservador.noiAcum[year],
    retornoTotal: ESCENARIOS.conservador.valores[year] + ESCENARIOS.conservador.noiAcum[year] - proyectoInfo.inversion.total,
    retornoPct:   +((( ESCENARIOS.conservador.valores[year] + ESCENARIOS.conservador.noiAcum[year] - proyectoInfo.inversion.total) / proyectoInfo.inversion.total) * 100).toFixed(1),
  },
  critico: {
    valor:        ESCENARIOS.critico.valores[year],
    noiAcum:      ESCENARIOS.critico.noiAcum[year],
    retornoTotal: ESCENARIOS.critico.valores[year] + ESCENARIOS.critico.noiAcum[year] - proyectoInfo.inversion.total,
    retornoPct:   +((( ESCENARIOS.critico.valores[year] + ESCENARIOS.critico.noiAcum[year] - proyectoInfo.inversion.total) / proyectoInfo.inversion.total) * 100).toFixed(1),
  },
}))
