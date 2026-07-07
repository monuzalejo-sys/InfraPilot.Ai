import * as XLSX from "xlsx"
import type { GeneratedBudget } from "@/types"
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
/** Editable percentage cell (stored as fraction, e.g. 10% -> 0.10) so formulas can reference it directly. */
function pInput(v: number)       { return { v: v / 100, t: "n" as const, z: PCT } }
/**
 * Numeric formula cell. SheetJS's writer drops `f`-only cells that carry no `v`,
 * so we always ship the pre-computed result as the cached value — Excel/Sheets
 * recalculates it from the formula the moment any referenced cell changes.
 */
function f(formula: string, value: number, fmt = PEN) { return { t: "n" as const, f: formula, v: value, z: fmt } }

function sheet(rows: Row[], widths: number[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws["!cols"] = widths.map((w) => ({ wch: w }))
  return ws
}

// ── SHEET 1 — RESUMEN ─────────────────────────────────────────
// Layout below is fixed row-by-row so formulas can reference exact cell addresses.
// Column B holds importes, column C holds % (editable where noted).
function buildResumen(b: GeneratedBudget): XLSX.WorkSheet {
  const fin = financialSummary
  const aiu = fin.aiu
  const totalPartidas = b.sections.reduce((s, sec) => s + sec.items.length, 0)

  const rows: Row[] = [
    ["INFRAPILOT AI  ·  PRESUPUESTO DETALLADO"],                                   // 1
    ["Powered by Claude AI  ·  Precios CAPECO Lima"],                              // 2
    [],                                                                            // 3
    ["DATOS DEL PROYECTO"],                                                        // 4
    ["Proyecto:",      budgetMeta.projectName],                                    // 5
    ["Código:",        `${budgetMeta.code}  ·  ${budgetMeta.version}`],            // 6
    ["Ubicación:",     budgetMeta.location],                                       // 7
    ["Cliente:",       budgetMeta.client],                                         // 8
    ["Contratista:",   budgetMeta.contractor],                                     // 9
    ["Supervisor:",    budgetMeta.supervisor],                                     // 10
    ["Elaborado por:", budgetMeta.preparedBy],                                     // 11
    ["Fecha:",         budgetMeta.date],                                           // 12
    ["Válido hasta:",  budgetMeta.validUntil],                                     // 13
    ["Fuente precios:",budgetMeta.priceSource],                                    // 14
    ["Confianza IA:",  `${budgetMeta.confidence}%`],                               // 15
    [],                                                                            // 16
    ["ALCANCE"],                                                                    // 17
    ["Área construida:", n(budgetMeta.totalArea, INT), "m²"],                      // 18
    ["Distribución:",    `${budgetMeta.floors} pisos + 2 sótanos`, ""],            // 19
    ["Plazo:",           `${budgetMeta.duration} meses`, ""],                      // 20
    ["Secciones:",       n(b.sections.length, INT), ""],                          // 21
    ["Partidas totales:", n(totalPartidas, INT), ""],                             // 22
    [],                                                                            // 23
    ["ESTRUCTURA FINANCIERA", "IMPORTE (PEN)", "%"],                              // 24 (row 24)
    ["COSTO DIRECTO", n(fin.directCost), ""],                                     // 25 -> B25
    ["  Materiales", n(costBreakdown.materials.amount), p(costBreakdown.materials.pct)],       // 26
    ["  Mano de Obra", n(costBreakdown.labor.amount), p(costBreakdown.labor.pct)],              // 27
    ["  Equipos y Herramientas", n(costBreakdown.equipment.amount), p(costBreakdown.equipment.pct)], // 28
    ["  Otros / Subcontratos", n(costBreakdown.otros.amount), p(costBreakdown.otros.pct)],      // 29
    [],                                                                            // 30
    ["AIU — ADMINISTRACIÓN, IMPREVISTOS Y UTILIDAD"],                             // 31
    [`  A — ${aiu.admin.label}`,       f("B25*C32", aiu.admin.amount, PEN),       pInput(aiu.admin.pct)],       // 32: B32 = COSTO DIRECTO * % editable en C32
    [`  I — ${aiu.contingency.label}`, f("B25*C33", aiu.contingency.amount, PEN), pInput(aiu.contingency.pct)], // 33
    [`  U — ${aiu.profit.label}`,      f("B25*C34", aiu.profit.amount, PEN),      pInput(aiu.profit.pct)],      // 34
    ["  TOTAL AIU", f("B32+B33+B34", aiu.totalAmount, PEN), f("C32+C33+C34", aiu.totalPct / 100, PCT)],  // 35
    [],                                                                            // 36
    ["SUBTOTAL  (Costo Directo + AIU)", f("B25+B35", fin.subtotal, PEN), ""],     // 37
    [`IGV`, f("B37*C38", fin.igv.amount, PEN), pInput(fin.igv.rate)],             // 38: % de IGV editable en C38
    [],                                                                            // 39
    ["TOTAL PRESUPUESTO", f("B37+B38", fin.total, PEN), ""],                      // 40
    [],                                                                            // 41
    ["INDICADORES CLAVE"],                                                        // 42
    ["Costo directo / m²", f(`B25/B18`, fin.perSqm.direct, '"S/ "#,##0'), "PEN/m²"], // 43
    ["Costo total / m²", f(`B40/B18`, fin.perSqm.total, '"S/ "#,##0'), "PEN/m²"], // 44
    ["Costo total / m²", n(fin.perSqm.totalUSD, '"$ "#,##0'), "USD/m²"],          // 45 (sin tipo de cambio en el modelo, se mantiene literal)
    ["Rango de mercado (Miraflores)", "$ 380 – $ 480 USD/m²", "referencia"],      // 46
    [],                                                                            // 47
    ["---"],                                                                      // 48
    [`Generado por InfraPilot AI  ·  ${budgetMeta.date}  ·  CAPECO Lima Jun-2026`], // 49
  ]

  return sheet(rows, [46, 24, 18])
}

// ── SHEET 2 — ACTIVIDADES ─────────────────────────────────────
// Cantidad y P. Unitario quedan como valores editables; Parcial y subtotales son fórmulas.
function buildActividades(b: GeneratedBudget): XLSX.WorkSheet {
  const rows: Row[] = [
    ["PARTIDAS DEL PRESUPUESTO — " + budgetMeta.projectName.toUpperCase()],
    [],
    ["CÓDIGO", "DESCRIPCIÓN", "UND.", "METRADO", "P. UNITARIO (PEN)", "PARCIAL (PEN)", "IA"],
  ]

  const sectionSubtotalRows: number[] = [] // 1-indexed excel rows holding each section subtotal formula

  for (const sec of b.sections) {
    const itemStartRow = rows.length + 2 // first item row (1-indexed, after the section header row we're about to push)
    const itemEndRow = itemStartRow + sec.items.length - 1

    // Section header — subtotal (col F) is SUM() of its own items' Parcial column
    const sectionRowIdx = rows.length + 1 // 1-indexed row this header will occupy
    rows.push([
      sec.code,
      sec.name.toUpperCase(),
      "", "", "",
      sec.items.length > 0 ? f(`SUM(F${itemStartRow}:F${itemEndRow})`, sec.subtotal, PEN) : n(0),
      "",
    ])

    // Items — quantity & unit price are literal editable values, Parcial = D*E
    for (let i = 0; i < sec.items.length; i++) {
      const item = sec.items[i]
      const rowNum = itemStartRow + i
      rows.push([
        item.code,
        item.name,
        item.unit,
        n(item.quantity, INT),
        n(item.unitPrice),
        f(`D${rowNum}*E${rowNum}`, item.totalPrice, PEN),
        item.isAiGenerated ? `✦ ${Math.round((item.confidence ?? 0.9) * 100)}%` : "",
      ])
    }
    sectionSubtotalRows.push(sectionRowIdx)
    rows.push([])
  }

  const totalRowRefs = sectionSubtotalRows.map((r) => `F${r}`).join("+")
  const grandTotal = b.sections.reduce((s, sec) => s + sec.subtotal, 0)
  rows.push(["", "COSTO DIRECTO TOTAL", "", "", "", f(totalRowRefs || "0", grandTotal, PEN), ""])

  return sheet(rows, [12, 52, 8, 12, 20, 20, 10])
}

// ── SHEET 3 — APUs ────────────────────────────────────────────
function buildAPUs(b: GeneratedBudget): XLSX.WorkSheet {
  const rows: Row[] = [
    ["ANÁLISIS DE PRECIOS UNITARIOS — " + budgetMeta.projectName.toUpperCase()],
    [budgetMeta.priceSource],
    [],
  ]

  // Full APU detail for the main sample
  const apu = b.apuSample
  rows.push(
    [`APU DETALLADO · ${apu.itemCode}  ${apu.itemName}`],
    ["Unidad:", apu.unit, "", "Región:", apu.region, "", "Fecha:", apu.priceDate],
    ["Fuente:", apu.source],
    [],
    ["TIPO", "DESCRIPCIÓN", "UND.", "CANTIDAD", "P. UNITARIO", "PARCIAL"],
  )

  // qty (col D) and unit price (col E) stay as editable literals; PARCIAL (col F) = D*E formula.
  const lineRow = (t: string, d: string, u: string, q: number, pu: number, total: number, rowNum: number): Row =>
    [t, d, u, n(q, DEC3), n(pu), f(`D${rowNum}*E${rowNum}`, total, PEN)]

  const pushGroup = (
    label: string,
    items: typeof apu.materials,
  ): number[] => {
    const startRow = rows.length + 1 // 1-indexed row of first item to be pushed
    items.forEach((it, i) => {
      const rowNum = startRow + i
      rows.push(lineRow(label, it.description, it.unit, it.quantity, it.unitPrice, it.totalPrice, rowNum))
    })
    return items.length > 0 ? [startRow, startRow + items.length - 1] : []
  }

  const matRange = pushGroup("MATERIAL", apu.materials)
  const matSubtotalRow = rows.length + 1
  rows.push(["", "", "", "", "Subtotal materiales",
    matRange.length ? f(`SUM(F${matRange[0]}:F${matRange[1]})`, apu.materialsCost, PEN) : n(0)])
  rows.push([])

  const laborRange = pushGroup("MANO DE OBRA", apu.labor)
  const laborSubtotalRow = rows.length + 1
  rows.push(["", "", "", "", "Subtotal mano de obra",
    laborRange.length ? f(`SUM(F${laborRange[0]}:F${laborRange[1]})`, apu.laborCost, PEN) : n(0)])
  rows.push([])

  const equipRange = pushGroup("EQUIPO", apu.equipment)
  const equipSubtotalRow = rows.length + 1
  rows.push(["", "", "", "", "Subtotal equipos",
    equipRange.length ? f(`SUM(F${equipRange[0]}:F${equipRange[1]})`, apu.equipmentCost, PEN) : n(0)])
  rows.push([])

  rows.push(["", "", "", "", "PRECIO UNITARIO TOTAL",
    f(`F${matSubtotalRow}+F${laborSubtotalRow}+F${equipSubtotalRow}`, apu.totalCost, PEN)])
  rows.push([])
  rows.push([])

  // APU summary table — kept as literal values (independent APUs, not derived from the detail block above)
  rows.push(
    ["RESUMEN DE APUs GENERADOS POR IA"],
    [],
    ["CÓDIGO", "PARTIDA", "UND.", "MATERIALES", "MO", "EQUIPOS", "TOTAL", "CONFIANZA IA"],
  )
  for (const a of apusSummary) {
    const rowNum = rows.length + 1
    rows.push([
      a.code, a.partida, a.unit,
      n(a.materialsCost), n(a.laborCost), n(a.equipCost),
      f(`D${rowNum}+E${rowNum}+F${rowNum}`, a.total, PEN),
      `${Math.round(a.confidence * 100)}%`,
    ])
  }

  return sheet(rows, [14, 48, 8, 16, 16, 16, 16, 14])
}

// ── SHEET 4 — MATERIALES ──────────────────────────────────────
function buildMateriales(): XLSX.WorkSheet {
  const header: Row = ["DESCRIPCIÓN", "ESPECIFICACIÓN TÉCNICA", "UND.", "CANTIDAD", "P. UNITARIO (PEN)", "TOTAL (PEN)", "%"]
  const preRows: Row[] = [
    ["RELACIÓN DE MATERIALES — " + budgetMeta.projectName.toUpperCase()],
    [budgetMeta.priceSource],
    [],
  ]
  const dataStartRow = preRows.length + 2 // +1 for header row, +1 for 1-indexing

  const dataRows: Row[] = topMaterials.map((m, i) => {
    const rowNum = dataStartRow + i
    if (m.unit === "—") {
      // No qty/unit-price breakdown available — total stays a literal value.
      return [m.name, m.spec, m.unit, "—", "—", n(m.total), p(m.pct)]
    }
    return [
      m.name, m.spec, m.unit,
      n(m.qty, INT),
      n(m.unitPrice),
      f(`D${rowNum}*E${rowNum}`, m.total, PEN),
      f(`F${rowNum}/F${dataStartRow + topMaterials.length}`, m.pct / 100, PCT),
    ]
  })

  const totalRow = dataStartRow + topMaterials.length
  const materialsTotal = topMaterials.reduce((s, m) => s + m.total, 0)
  const rows: Row[] = [
    ...preRows,
    header,
    ...dataRows,
    [],
    ["TOTAL MATERIALES", "", "", "", "", f(`SUM(F${dataStartRow}:F${totalRow - 1})`, materialsTotal, PEN), p(100)],
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
  const preRows: Row[] = [
    ["RELACIÓN DE MANO DE OBRA — " + budgetMeta.projectName.toUpperCase()],
    ["Tarifas según CAPECO y sindicatos de construcción civil · Lima 2026"],
    [],
    ["POR CATEGORÍA LABORAL"],
    [],
    ["CATEGORÍA", "HORAS-HOMBRE (HH)", "TARIFA (PEN/HH)", "TOTAL (PEN)", "% DEL TOTAL MO"],
  ]
  const catStartRow = preRows.length + 1 // 1-indexed first category row

  const catRows: Row[] = laborBreakdown.map((lb, i) => {
    const rowNum = catStartRow + i
    return [
      lb.category,
      n(lb.hh, INT),
      n(lb.unitPrice),
      f(`B${rowNum}*C${rowNum}`, lb.total, PEN),
      f(`D${rowNum}/D${catStartRow + laborBreakdown.length}`, lb.pct / 100, PCT),
    ]
  })
  const catTotalRow = catStartRow + laborBreakdown.length
  const totalHH = laborBreakdown.reduce((s, l) => s + l.hh, 0)
  const totalMO = costBreakdown.labor.amount

  const bySectionHeaderRow = catTotalRow + 4 // blank, blank, "POR SECCIÓN...", blank -> then header
  const secStartRow = bySectionHeaderRow + 1
  const secRows: Row[] = laborBySection.map((ls) => [ls.section, n(ls.hh, INT), n(ls.total)])
  const secTotalRow = secStartRow + laborBySection.length
  const secTotalHH = laborBySection.reduce((s, l) => s + l.hh, 0)

  const rows: Row[] = [
    ...preRows,
    ...catRows,
    [],
    ["TOTAL MANO DE OBRA",
      f(`SUM(B${catStartRow}:B${catTotalRow - 1})`, totalHH, INT),
      "",
      f(`SUM(D${catStartRow}:D${catTotalRow - 1})`, totalMO, PEN),
      p(100)],
    [],
    [],
    ["POR SECCIÓN DE OBRA"],
    [],
    ["SECCIÓN", "HORAS-HOMBRE (HH)", "IMPORTE (PEN)"],
    ...secRows,
    [],
    [
      "TOTAL",
      f(`SUM(B${secStartRow}:B${secTotalRow - 1})`, secTotalHH, INT),
      f(`SUM(C${secStartRow}:C${secTotalRow - 1})`, totalMO, PEN),
    ],
    [],
    ["Nota: Se incluye el 3% de herramientas manuales calculado sobre el total de MO."],
    ["Las horas-hombre consideran un rendimiento promedio estándar para Lima zona 4."],
  ]

  return sheet(rows, [40, 20, 20, 20, 18])
}

// ── Main export ───────────────────────────────────────────────
export function exportPresupuestoExcel(budget?: GeneratedBudget) {
  const b = budget ?? mockGeneratedBudget
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, buildResumen(b),     "Resumen")
  XLSX.utils.book_append_sheet(wb, buildActividades(b), "Actividades")
  XLSX.utils.book_append_sheet(wb, buildAPUs(b),        "APUs")
  XLSX.utils.book_append_sheet(wb, buildMateriales(),   "Materiales")
  XLSX.utils.book_append_sheet(wb, buildManoObra(),     "Mano de Obra")

  const filename = `InfraPilot-${budgetMeta.projectCode}-${budgetMeta.date}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ── Reusable formula-driven workbook builder (used by engineering modules) ──
export interface HojaConFormulas {
  nombre: string
  // celdas por referencia A1: valor literal, o { f: "B2*C2" } para fórmula
  celdas: Record<string, string | number | { f: string }>
  anchosColumnas?: number[]  // en caracteres, opcional
}

/**
 * Resolves a formula string to a numeric cached value by substituting cell/range
 * references with already-known numeric values from the same sheet. Only the
 * arithmetic subset used across this codebase is supported: +, -, *, /, parens,
 * and SUM(range). SheetJS's writer silently drops formula cells that carry no
 * cached `v`, so every formula cell needs one — Excel recalculates it for real
 * the moment a referenced input changes.
 */
function evaluarFormula(formula: string, valores: Map<string, number>): number {
  let missing = false
  const need = (ref: string): number => {
    const v = valores.get(ref.toUpperCase())
    if (v === undefined) missing = true
    return v ?? 0
  }

  let expr = formula.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (_m, startRef: string, endRef: string) => {
    const start = XLSX.utils.decode_cell(startRef)
    const end = XLSX.utils.decode_cell(endRef)
    let sum = 0
    for (let r = start.r; r <= end.r; r++) {
      for (let c = start.c; c <= end.c; c++) {
        sum += need(XLSX.utils.encode_cell({ r, c }))
      }
    }
    return String(sum)
  })

  expr = expr.replace(/[A-Z]+\d+/gi, (ref) => String(need(ref)))

  if (missing) throw new Error("dependencia aún no resuelta")
  if (!/^[\d+\-*/().\s]*$/.test(expr)) {
    throw new Error(`Fórmula no soportada por el evaluador: "${formula}"`)
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${expr || "0"});`)() as number
}

/** Pure worksheet builder — no I/O, easy to unit-test. */
export function construirHojaConFormulas(hoja: HojaConFormulas): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  let minC = Infinity, minR = Infinity, maxC = -Infinity, maxR = -Infinity

  const valores = new Map<string, number>()
  for (const [addr, value] of Object.entries(hoja.celdas)) {
    if (typeof value === "number") valores.set(addr, value)
  }

  // Formula cells may reference other formula cells declared later in the object.
  // Resolve in dependency order with a few passes over the (small, sheet-sized) entry list.
  const pending = Object.entries(hoja.celdas).filter(
    (entry): entry is [string, { f: string }] => typeof entry[1] === "object" && "f" in entry[1],
  )
  let unresolved = pending
  for (let pass = 0; pass < pending.length + 1 && unresolved.length > 0; pass++) {
    const stillUnresolved: typeof pending = []
    for (const [addr, value] of unresolved) {
      try {
        valores.set(addr, evaluarFormula(value.f, valores))
      } catch {
        stillUnresolved.push([addr, value])
      }
    }
    unresolved = stillUnresolved
  }

  for (const [addr, value] of Object.entries(hoja.celdas)) {
    const { c, r } = XLSX.utils.decode_cell(addr)
    minC = Math.min(minC, c); maxC = Math.max(maxC, c)
    minR = Math.min(minR, r); maxR = Math.max(maxR, r)

    if (typeof value === "object" && "f" in value) {
      ws[addr] = { t: "n", f: value.f, v: valores.get(addr) ?? evaluarFormula(value.f, valores) }
    } else if (typeof value === "number") {
      ws[addr] = { t: "n", v: value }
    } else {
      ws[addr] = { t: "s", v: value }
    }
  }

  ws["!ref"] = XLSX.utils.encode_range({
    s: { c: minC === Infinity ? 0 : minC, r: minR === Infinity ? 0 : minR },
    e: { c: maxC === -Infinity ? 0 : maxC, r: maxR === -Infinity ? 0 : maxR },
  })

  if (hoja.anchosColumnas) {
    ws["!cols"] = hoja.anchosColumnas.map((w) => ({ wch: w }))
  }

  return ws
}

/** Builds a workbook from formula-driven sheets and triggers a client-side download. */
export function crearLibroConFormulas(hojas: HojaConFormulas[], nombreArchivo: string): void {
  const wb = XLSX.utils.book_new()
  for (const hoja of hojas) {
    XLSX.utils.book_append_sheet(wb, construirHojaConFormulas(hoja), hoja.nombre)
  }
  XLSX.writeFile(wb, nombreArchivo)
}
