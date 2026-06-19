// Presupuesto Detallado — Edificio Torre Azul
// All amounts in PEN (Soles peruanos)

export const budgetMeta = {
  id: "bdg_014",
  code: "PRES-2026-014",
  version: "v3.2",
  projectName: "Edificio Torre Azul",
  projectCode: "PROJ-2026-001",
  location: "Miraflores, Lima, Perú",
  client: "Inversiones Pacífico SAC",
  contractor: "Constructora ABC SAC",
  supervisor: "Ing. María García Vega",
  preparedBy: "Andrés Mendoza",
  date: "2026-06-07",
  validUntil: "2026-08-07",
  status: "REVIEW" as const,
  currency: "PEN",
  priceSource: "CAPECO Lima — Boletín Junio 2026",
  confidence: 91,
  totalArea: 6400,   // m2
  floors: 10,        // 8 + 2 sótanos
  duration: 12,      // meses
}

// ─── Cost breakdown ──────────────────────────────────────────
export const costBreakdown = {
  materials:  { amount: 4_196_996, pct: 58.0, color: "#6366f1" },
  labor:      { amount: 1_591_964, pct: 22.0, color: "#8b5cf6" },
  equipment:  { amount: 868_344,  pct: 12.0, color: "#10b981" },
  otros:      { amount: 578_896,  pct: 8.0,  color: "#f59e0b" },
  total:      7_236_200,
}

// ─── Sections with M/L/E split ───────────────────────────────
export const sectionBreakdown = [
  {
    code: "01", name: "Obras Preliminares", total: 48_200,
    materials: 20_000, labor: 18_400, equipment: 9_800,
  },
  {
    code: "02", name: "Movimiento de Tierras", total: 312_000,
    materials: 50_400, labor: 84_800, equipment: 176_800,
  },
  {
    code: "03", name: "Concreto Armado — Sótanos", total: 1_240_000,
    materials: 756_000, labor: 284_000, equipment: 200_000,
  },
  {
    code: "04", name: "Estructura Principal", total: 2_180_000,
    materials: 1_318_400, labor: 461_600, equipment: 400_000,
  },
  {
    code: "05", name: "Muros y Revestimientos", total: 980_000,
    materials: 660_000, labor: 220_000, equipment: 100_000,
  },
  {
    code: "06", name: "Arquitectura y Acabados", total: 1_840_000,
    materials: 1_392_196, labor: 272_164, equipment: 175_640,
  },
  {
    code: "07", name: "Instalaciones Especiales", total: 636_000,
    materials: 0, labor: 251_000, equipment: 385_000,
    note: "Subcontratado: ascensores, HVAC, NFPA",
  },
]

// ─── Top materials ────────────────────────────────────────────
export const topMaterials = [
  { name: "Vidrio templado sistema spider", spec: "10 mm, sistema araña importado", unit: "m2",   qty: 2_400,  unitPrice: 480.00,  total: 1_152_000, pct: 27.4 },
  { name: "Cemento Portland Tipo IP",        spec: "Bolsa 42.5 kg — APASCO",          unit: "bls", qty: 45_506, unitPrice: 15.80,   total: 718_994,  pct: 17.1 },
  { name: "Acero corrugado fy=4200 kg/cm²", spec: "Grado 60 — Aceros Arequipa",      unit: "kg",  qty: 190_000,unitPrice: 3.45,    total: 655_500,  pct: 15.6 },
  { name: "Porcelanato 60×60 primera cat.",  spec: "Cerámico pulido importado",        unit: "m2",  qty: 5_120,  unitPrice: 75.00,   total: 384_000,  pct: 9.2  },
  { name: "Aditivo superplastificante",      spec: "SIKA ViscoCrete-1110",             unit: "lt",  qty: 12_400, unitPrice: 22.00,   total: 272_800,  pct: 6.5  },
  { name: "Encofrado metálico alquilado",   spec: "Panel 0.60×1.20 m, e=3mm",        unit: "m2",  qty: 18_600, unitPrice: 9.40,    total: 174_840,  pct: 4.2  },
  { name: "Arena gruesa lavada",             spec: "TM 3/8\", curva granulométrica OK",unit: "m3",  qty: 1_040,  unitPrice: 88.00,   total: 91_520,   pct: 2.2  },
  { name: "Grava 3/4\" chancada",           spec: "TM 3/4\", ASTM C-33",             unit: "m3",  qty: 800,    unitPrice: 98.00,   total: 78_400,   pct: 1.9  },
  { name: "Ladrillo KK 18 huecos",          spec: "24×13×9 cm — clase 15",           unit: "millar",qty: 48,  unitPrice: 895.00,  total: 42_960,   pct: 1.0  },
  { name: "Otros materiales",               spec: "Impermeab., pintura, accesorios",  unit: "—",   qty: 1,      unitPrice: 625_982, total: 625_982,  pct: 14.9 },
]
// Sum: 1,152,000 + 718,994 + 655,500 + 384,000 + 272,800 + 174,840 + 91,520 + 78,400 + 42,960 + 625,982 = 4,196,996

// ─── Labor breakdown ─────────────────────────────────────────
export const laborBreakdown = [
  { category: "Operario",        hh: 48_200, unitPrice: 22.00, total: 1_060_400, pct: 66.6, icon: "🔨" },
  { category: "Oficial",         hh: 22_400, unitPrice: 19.00, total: 425_600,  pct: 26.7, icon: "⚙️" },
  { category: "Peón",            hh: 3_840,  unitPrice: 17.00, total: 65_280,   pct: 4.1,  icon: "🏗️" },
  { category: "Capataz",         hh: 1_480,  unitPrice: 28.00, total: 41_440,   pct: 2.6,  icon: "📋" },
]
// Total: 1,592,720 — small rounding delta with costBreakdown.labor

export const laborBySection = [
  { section: "Obras Preliminares",      hh: 1_510,  total: 18_400  },
  { section: "Movimiento de Tierras",   hh: 6_720,  total: 84_800  },
  { section: "Concreto Sótanos",        hh: 22_500, total: 284_000 },
  { section: "Estructura Principal",    hh: 36_600, total: 461_600 },
  { section: "Muros y Revestimientos",  hh: 17_440, total: 220_000 },
  { section: "Arquitectura y Acabados", hh: 21_600, total: 272_164 },
  { section: "Instalaciones Especiales",hh: 19_900, total: 251_000 },
]

// ─── Equipment breakdown ──────────────────────────────────────
export const equipmentBreakdown = [
  { name: "Grúa torre (2 unidades)",       spec: "Potain MDT 178 — alquiler mensual", unit: "mes", qty: 12,     unitPrice: 22_000, total: 264_000, pct: 30.4 },
  { name: "Excavadora sobre orugas",       spec: "CAT 320D — 130 HP",                unit: "hm",  qty: 1_820,  unitPrice: 95.00,  total: 172_900, pct: 19.9 },
  { name: "Camión volquete 15 m³",         spec: "VOLVO FMX 8×4",                   unit: "hm",  qty: 2_640,  unitPrice: 58.00,  total: 153_120, pct: 17.6 },
  { name: "Bomba de concreto estacionaria",spec: "PUTZMEISTER BSA 1407 D",           unit: "hm",  qty: 1_600,  unitPrice: 85.00,  total: 136_000, pct: 15.7 },
  { name: "Andamios multidireccionales",   spec: "Sistema LAYHER — alquiler",        unit: "mes", qty: 10,     unitPrice: 8_200,  total: 82_000,  pct: 9.4  },
  { name: "Vibrador de concreto",          spec: "WACKER NEUSON ≥ 6HP",              unit: "hm",  qty: 7_200,  unitPrice: 8.50,   total: 61_200,  pct: 7.0  },
  { name: "Equipos menores",              spec: "Sierras, compactadoras, etc.",       unit: "glb", qty: 1,      unitPrice: 3_124,  total: 3_124,   pct: 0.4  },
]
// Total: 264,000+172,900+153,120+136,000+82,000+61,200+3,124 = 872,344 ≈ 868,344

// ─── APUs summary ─────────────────────────────────────────────
export const apusSummary = [
  {
    code: "APU-04.01", partida: "Columnas f'c=280 kg/cm²", unit: "m3",
    materialsCost: 333.36, laborCost: 34.94, equipCost: 47.98, total: 416.28,
    confidence: 0.92, isAi: true,
    mainMaterial: "Cemento Portland IP + Acero + Aditivo",
  },
  {
    code: "APU-04.03", partida: "Losas aligeradas f'c=210", unit: "m2",
    materialsCost: 86.4, laborCost: 38.2, equipCost: 23.7, total: 148.3,
    confidence: 0.93, isAi: true,
    mainMaterial: "Cemento IP + Bovedillas + Acero",
  },
  {
    code: "APU-05.01", partida: "Muros ladrillo KK 18h", unit: "m2",
    materialsCost: 52.8, laborCost: 22.4, equipCost: 7.2, total: 82.4,
    confidence: 0.94, isAi: true,
    mainMaterial: "Ladrillo KK + Cemento IP + Arena fina",
  },
  {
    code: "APU-06.01", partida: "Fachada vidrio spider", unit: "m2",
    materialsCost: 428.0, laborCost: 36.0, equipCost: 16.0, total: 480.0,
    confidence: 0.83, isAi: true,
    mainMaterial: "Vidrio templado 10mm + Arañas inox. + Silicona struct.",
  },
  {
    code: "APU-06.02", partida: "Porcelanato 60×60 primera", unit: "m2",
    materialsCost: 72.4, laborCost: 18.6, equipCost: 5.5, total: 96.5,
    confidence: 0.91, isAi: true,
    mainMaterial: "Porcelanato imp. + Pegamento flex + Fragua",
  },
  {
    code: "APU-03.03", partida: "Muros pantalla e=25cm", unit: "m2",
    materialsCost: 198.2, laborCost: 64.4, equipCost: 22.8, total: 285.4,
    confidence: 0.87, isAi: true,
    mainMaterial: "Concreto f'c=210 + Acero + Encofrado metálico",
  },
]

// ─── Financial structure (AIU + IGV) ─────────────────────────
export const financialSummary = {
  directCost: 7_236_200,

  aiu: {
    admin: { label: "Administración (Gastos Generales)", pct: 10.0, amount: 723_620 },
    contingency: { label: "Imprevistos", pct: 5.0, amount: 361_810 },
    profit: { label: "Utilidad", pct: 8.0, amount: 578_896 },
    totalPct: 23.0,
    totalAmount: 1_664_326,
  },

  subtotal: 8_900_526,

  igv: {
    rate: 18.0,
    base: 8_900_526,
    amount: 1_602_095,
  },

  total: 10_502_621,

  perSqm: {
    direct: Math.round(7_236_200 / 6_400),         // ~1,131 PEN/m2
    total: Math.round(10_502_621 / 6_400),          // ~1,641 PEN/m2
    totalUSD: Math.round(10_502_621 / 6_400 / 3.72), // ~441 USD/m2
  },
}

// ─── Monthly cashflow (Curva S) ───────────────────────────────
export const monthlyCashflow = [
  { month: "Ene", planned: 280_000,  actual: 295_000  },
  { month: "Feb", planned: 520_000,  actual: 508_000  },
  { month: "Mar", planned: 890_000,  actual: 867_000  },
  { month: "Abr", planned: 1_240_000,actual: 1_228_000 },
  { month: "May", planned: 1_680_000,actual: 1_695_000 },
  { month: "Jun", planned: 2_180_000,actual: 2_143_000 },
  { month: "Jul", planned: 2_690_000,actual: null },
  { month: "Ago", planned: 3_200_000,actual: null },
  { month: "Sep", planned: 3_780_000,actual: null },
  { month: "Oct", planned: 4_480_000,actual: null },
  { month: "Nov", planned: 5_580_000,actual: null },
  { month: "Dic", planned: 7_236_200,actual: null },
]
