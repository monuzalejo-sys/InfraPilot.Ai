import * as XLSX from "xlsx"
import { mockGeneratedBudget } from "./mock-data"
import {
  budgetMeta,
  costBreakdown,
  topMaterials,
  laborBreakdown,
  laborBySection,
  apusSummary,
  financialSummary,
} from "./mock-budget-detail"

// ── Cell helpers ──────────────────────────────────────────────
const PEN  = '"S/ "#,##0.00'
const INT  = '#,##0'
const PCT  = '0.0%'
const DEC3 = '0.000'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any[]

function n(v: number, fmt = PEN) { return { v, t: "n" as const, z: fmt } }
function p(v: number)            { return { v: v / 100, t: "n" as const, z: PCT } }

function sheet(rows: Row[], widths: number[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws["!cols"] = widths.map((w) => ({ wch: w }))
  return ws
}

// ── SHEET 1 — RESUMEN ─────────────────────────────────────────
function buildResumen(): XLSX.WorkSheet {
  const fin = financialSummary
  const aiu = fin.aiu
  const totalPartidas = mockGeneratedBudget.sections.reduce((s, sec) => s + sec.items.length, 0)

  const rows: Row[] = [
    ["INFRAPILOT AI  ·  PRESUPUESTO DETALLADO"],
    ["Powered by Claude AI  ·  Precios CAPECO Lima"],
    [],
    ["DATOS DEL PROYECTO"],
    ["Proyecto:",      budgetMeta.projectName],
    ["Código:",        `${budgetMeta.code}  ·  ${budgetMeta.version}`],
    ["Ubicación:",     budgetMeta.location],
    ["Cliente:",       budgetMeta.client],
    ["Contratista:",   budgetMeta.contractor],
    ["Supervisor:",    budgetMeta.supervisor],
    ["Elaborado por:", budgetMeta.preparedBy],
    ["Fecha:",         budgetMeta.date],
    ["Válido hasta:",  budgetMeta.validUntil],
    ["Fuente precios:",budgetMeta.priceSource],
    ["Confianza IA:",  `${budgetMeta.confidence}%`],
    [],
    ["ALCANCE"],
    ["Área construida:", n(budgetMeta.totalArea, INT), "m²"],
    ["Distribución:",    `${budgetMeta.floors} pisos + 2 sótanos`, ""],
    ["Plazo:",           `${budgetMeta.duration} meses`, ""],
    ["Secciones:",       n(mockGeneratedBudget.sections.length, INT), ""],
    ["Partidas totales:", n(totalPartidas, INT), ""],
    [],
    ["ESTRUCTURA FINANCIERA", "IMPORTE (PEN)", "%"],
    ["COSTO DIRECTO", n(fin.directCost), ""],
    ["  Materiales", n(costBreakdown.materials.amount), p(costBreakdown.materials.pct)],
    ["  Mano de Obra", n(costBreakdown.labor.amount), p(costBreakdown.labor.pct)],
    ["  Equipos y Herramientas", n(costBreakdown.equipment.amount), p(costBreakdown.equipment.pct)],
    ["  Otros / Subcontratos", n(costBreakdown.otros.amount), p(costBreakdown.otros.pct)],
    [],
    ["AIU — ADMINISTRACIÓN, IMPREVISTOS Y UTILIDAD"],
    [`  A — ${aiu.admin.label}`, n(aiu.admin.amount), `${aiu.admin.pct}% s/CD`],
    [`  I — ${aiu.contingency.label}`, n(aiu.contingency.amount), `${aiu.contingency.pct}% s/CD`],
    [`  U — ${aiu.profit.label}`, n(aiu.profit.amount), `${aiu.profit.pct}% s/CD`],
    ["  TOTAL AIU", n(aiu.totalAmount), `${aiu.totalPct}% s/CD`],
    [],
    ["SUBTOTAL  (Costo Directo + AIU)", n(fin.subtotal), ""],
    [`IGV  (${fin.igv.rate}%)`, n(fin.igv.amount), ""],
    [],
    ["TOTAL PRESUPUESTO", n(fin.total), ""],
    [],
    ["INDICADORES CLAVE"],
    ["Costo directo / m²", n(fin.perSqm.direct, '"S/ "#,##0'), "PEN/m²"],
    ["Costo total / m²", n(fin.perSqm.total, '"S/ "#,##0'), "PEN/m²"],
    ["Costo total / m²", n(fin.perSqm.totalUSD, '"$ "#,##0'), "USD/m²"],
    ["Rango de mercado (Miraflores)", "$ 380 – $ 480 USD/m²", "referencia"],
    [],
    ["---"],
    [`Generado por InfraPilot AI  ·  ${budgetMeta.date}  ·  CAPECO Lima Jun-2026`],
  ]

  return sheet(rows, [46, 24, 18])
}

// ── SHEET 2 — ACTIVIDADES ─────────────────────────────────────
function buildActividades(): XLSX.WorkSheet {
  const rows: Row[] = [
    ["PARTIDAS DEL PRESUPUESTO — " + budgetMeta.projectName.toUpperCase()],
    [],
    ["CÓDIGO", "DESCRIPCIÓN", "UND.", "METRADO", "P. UNITARIO (PEN)", "PARCIAL (PEN)", "IA"],
  ]

  for (const sec of mockGeneratedBudget.sections) {
    // Section header
    rows.push([sec.code, sec.name.toUpperCase(), "", "", "", n(sec.subtotal), ""])
    // Items
    for (const item of sec.items) {
      rows.push([
        item.code,
        item.name,
        item.unit,
        n(item.quantity, INT),
        n(item.unitPrice),
        n(item.totalPrice),
        item.isAiGenerated ? `✦ ${Math.round((item.confidence ?? 0.9) * 100)}%` : "",
      ])
    }
    rows.push([])
  }

  const total = mockGeneratedBudget.sections.reduce((s, sec) => s + sec.subtotal, 0)
  rows.push(["", "COSTO DIRECTO TOTAL", "", "", "", n(total), ""])

  return sheet(rows, [12, 52, 8, 12, 20, 20, 10])
}

// ── SHEET 3 — APUs ────────────────────────────────────────────
function buildAPUs(): XLSX.WorkSheet {
  const rows: Row[] = [
    ["ANÁLISIS DE PRECIOS UNITARIOS — " + budgetMeta.projectName.toUpperCase()],
    [budgetMeta.priceSource],
    [],
  ]

  // Full APU detail for the main sample
  const apu = mockGeneratedBudget.apuSample
  rows.push(
    [`APU DETALLADO · ${apu.itemCode}  ${apu.itemName}`],
    ["Unidad:", apu.unit, "", "Región:", apu.region, "", "Fecha:", apu.priceDate],
    ["Fuente:", apu.source],
    [],
    ["TIPO", "DESCRIPCIÓN", "UND.", "CANTIDAD", "P. UNITARIO", "PARCIAL"],
  )

  const line = (t: string, d: string, u: string, q: number, pu: number, tot: number): Row =>
    [t, d, u, n(q, DEC3), n(pu), n(tot)]

  rows.push(
    ...apu.materials.map((m) => line("MATERIAL", m.description, m.unit, m.quantity, m.unitPrice, m.totalPrice)),
    ["", "", "", "", "Subtotal materiales", n(apu.materialsCost)],
    [],
    ...apu.labor.map((l) => line("MANO DE OBRA", l.description, l.unit, l.quantity, l.unitPrice, l.totalPrice)),
    ["", "", "", "", "Subtotal mano de obra", n(apu.laborCost)],
    [],
    ...apu.equipment.map((e) => line("EQUIPO", e.description, e.unit, e.quantity, e.unitPrice, e.totalPrice)),
    ["", "", "", "", "Subtotal equipos", n(apu.equipmentCost)],
    [],
    ["", "", "", "", "PRECIO UNITARIO TOTAL", n(apu.totalCost)],
    [],
    [],
  )

  // APU summary table
  rows.push(
    ["RESUMEN DE APUs GENERADOS POR IA"],
    [],
    ["CÓDIGO", "PARTIDA", "UND.", "MATERIALES", "MO", "EQUIPOS", "TOTAL", "CONFIANZA IA"],
    ...apusSummary.map((a) => [
      a.code, a.partida, a.unit,
      n(a.materialsCost), n(a.laborCost), n(a.equipCost), n(a.total),
      `${Math.round(a.confidence * 100)}%`,
    ]),
  )

  return sheet(rows, [14, 48, 8, 16, 16, 16, 16, 14])
}

// ── SHEET 4 — MATERIALES ──────────────────────────────────────
function buildMateriales(): XLSX.WorkSheet {
  const rows: Row[] = [
    ["RELACIÓN DE MATERIALES — " + budgetMeta.projectName.toUpperCase()],
    [budgetMeta.priceSource],
    [],
    ["DESCRIPCIÓN", "ESPECIFICACIÓN TÉCNICA", "UND.", "CANTIDAD", "P. UNITARIO (PEN)", "TOTAL (PEN)", "%"],
    ...topMaterials.map((m) => [
      m.name,
      m.spec,
      m.unit,
      m.unit === "—" ? "—" : n(m.qty, INT),
      m.unit === "—" ? "—" : n(m.unitPrice),
      n(m.total),
      p(m.pct),
    ]),
    [],
    ["TOTAL MATERIALES", "", "", "", "", n(costBreakdown.materials.amount), p(100)],
    [],
    [
      "Nota: Los precios son puesta en obra en Miraflores, Lima. " +
      "Incluyen transporte y descarga. Vigentes al " + budgetMeta.date + ".",
    ],
  ]

  return sheet(rows, [42, 40, 10, 14, 20, 20, 10])
}

// ── SHEET 5 — MANO DE OBRA ────────────────────────────────────
function buildManoObra(): XLSX.WorkSheet {
  const totalHH  = laborBreakdown.reduce((s, l) => s + l.hh, 0)
  const totalMO  = costBreakdown.labor.amount

  const rows: Row[] = [
    ["RELACIÓN DE MANO DE OBRA — " + budgetMeta.projectName.toUpperCase()],
    ["Tarifas según CAPECO y sindicatos de construcción civil · Lima 2026"],
    [],
    ["POR CATEGORÍA LABORAL"],
    [],
    ["CATEGORÍA", "HORAS-HOMBRE (HH)", "TARIFA (PEN/HH)", "TOTAL (PEN)", "% DEL TOTAL MO"],
    ...laborBreakdown.map((lb) => [
      lb.category,
      n(lb.hh, INT),
      n(lb.unitPrice),
      n(lb.total),
      p(lb.pct),
    ]),
    [],
    ["TOTAL MANO DE OBRA", n(totalHH, INT), "", n(totalMO), p(100)],
    [],
    [],
    ["POR SECCIÓN DE OBRA"],
    [],
    ["SECCIÓN", "HORAS-HOMBRE (HH)", "IMPORTE (PEN)"],
    ...laborBySection.map((ls) => [
      ls.section,
      n(ls.hh, INT),
      n(ls.total),
    ]),
    [],
    [
      "TOTAL",
      n(laborBySection.reduce((s, l) => s + l.hh, 0), INT),
      n(totalMO),
    ],
    [],
    ["Nota: Se incluye el 3% de herramientas manuales calculado sobre el total de MO."],
    ["Las horas-hombre consideran un rendimiento promedio estándar para Lima zona 4."],
  ]

  return sheet(rows, [40, 20, 20, 20, 18])
}

// ── Main export ───────────────────────────────────────────────
export function exportPresupuestoExcel() {
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, buildResumen(),     "Resumen")
  XLSX.utils.book_append_sheet(wb, buildActividades(), "Actividades")
  XLSX.utils.book_append_sheet(wb, buildAPUs(),        "APUs")
  XLSX.utils.book_append_sheet(wb, buildMateriales(),  "Materiales")
  XLSX.utils.book_append_sheet(wb, buildManoObra(),    "Mano de Obra")

  const filename = `InfraPilot-${budgetMeta.projectCode}-${budgetMeta.date}.xlsx`
  XLSX.writeFile(wb, filename)
}
