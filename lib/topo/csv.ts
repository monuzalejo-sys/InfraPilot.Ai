/* Parser tolerante de puntos topográficos desde texto CSV pegado o subido.
 *
 * Sin dependencias — se parsea a mano. Tolera:
 *   · Separadores: coma, punto y coma (;) o tabulación. Se autodetecta por fila.
 *   · Headers flexibles (mayúsc/minúsc, con/sin acentos):
 *         X,Y,Z            E,N,Z           ESTE,NORTE,COTA
 *         PUNTO,X,Y,Z      P,ESTE,NORTE,COTA ...
 *     Se reconoce la columna Este (X), Norte (Y) y Cota (Z) por nombre.
 *   · Sin header: se asume orden X,Y,Z (o P,X,Y,Z si hay 4 columnas y la
 *     primera no es numérica).
 *   · Decimales con punto o coma. Ojo: si el separador de campos es ";", la coma
 *     puede ser decimal; si el separador es ",", el decimal debe ser punto.
 *     `parseNumber` resuelve ambos casos con heurística.
 *
 * Funciones puras — devuelven datos + advertencias, no lanzan por filas malas.
 */

import type { TopoPoint } from "./cubicacion"

export interface CsvParseResult {
  points: TopoPoint[]
  /** Índice (0-based) de la fila de header detectada, o -1 si no había. */
  headerRow: number
  separator: "," | ";" | "\t"
  skipped: number       // filas de datos descartadas por inválidas
  warnings: string[]
}

// Sinónimos de header por eje (normalizados: sin acentos, minúsculas).
const X_KEYS = ["x", "e", "este", "est", "coord_x", "coordx", "easting"]
const Y_KEYS = ["y", "n", "norte", "nor", "coord_y", "coordy", "northing"]
const Z_KEYS = ["z", "cota", "elev", "elevacion", "altura", "h", "z_terreno"]

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function normHeader(s: string): string {
  return stripAccents(s.trim().toLowerCase()).replace(/[^a-z0-9_]/g, "")
}

/** Detecta el separador de una línea por frecuencia (; > tab > ,). */
export function detectSeparator(line: string): "," | ";" | "\t" {
  const semi = (line.match(/;/g) || []).length
  const tab = (line.match(/\t/g) || []).length
  const comma = (line.match(/,/g) || []).length
  if (semi >= tab && semi >= comma && semi > 0) return ";"
  if (tab >= comma && tab > 0) return "\t"
  return ","
}

/**
 * Convierte un token a número tolerando decimal por coma o punto.
 * Reglas:
 *   · "1.234,56" (formato es-CO/EU) → 1234.56  (punto=miles, coma=decimal)
 *   · "1,234.56" (formato en-US)    → 1234.56  (coma=miles, punto=decimal)
 *   · "12,5"     → 12.5   · "12.5" → 12.5   · "1000" → 1000
 * Devuelve NaN si no es numérico.
 */
export function parseNumber(raw: string): number {
  let s = raw.trim().replace(/\s/g, "")
  if (s === "") return NaN
  const hasComma = s.includes(",")
  const hasDot = s.includes(".")
  if (hasComma && hasDot) {
    // El último separador que aparece es el decimal; el otro es de miles.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".") // coma decimal
    } else {
      s = s.replace(/,/g, "") // coma de miles
    }
  } else if (hasComma) {
    // Sólo coma: tratar como decimal (caso más común en datos es-CO).
    s = s.replace(",", ".")
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function splitLine(line: string, sep: string): string[] {
  return line.split(sep).map((c) => c.trim())
}

/** ¿La fila parece un header? (algún campo mapea a X/Y/Z y no es todo numérico). */
function looksLikeHeader(cells: string[]): boolean {
  const norm = cells.map(normHeader)
  const anyKey =
    norm.some((c) => X_KEYS.includes(c)) &&
    norm.some((c) => Y_KEYS.includes(c)) &&
    norm.some((c) => Z_KEYS.includes(c))
  return anyKey
}

/** Índices de columna {x,y,z} a partir de un header. -1 si no se encontró. */
function mapHeader(cells: string[]): { x: number; y: number; z: number } {
  const norm = cells.map(normHeader)
  const find = (keys: string[]) => norm.findIndex((c) => keys.includes(c))
  return { x: find(X_KEYS), y: find(Y_KEYS), z: find(Z_KEYS) }
}

/**
 * Parsea texto CSV a puntos topográficos. No lanza por filas malas: las cuenta
 * en `skipped` y agrega advertencias.
 */
export function parseTopoCsv(text: string): CsvParseResult {
  const warnings: string[] = []
  const rawLines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.replace(/^﻿/, "")) // quita BOM
    .filter((l) => l.trim() !== "" && !l.trim().startsWith("#"))

  if (rawLines.length === 0) {
    return { points: [], headerRow: -1, separator: ",", skipped: 0, warnings: ["Texto vacío."] }
  }

  const separator = detectSeparator(rawLines[0])
  const firstCells = splitLine(rawLines[0], separator)

  let headerRow = -1
  let cols = { x: 0, y: 1, z: 2 }

  if (looksLikeHeader(firstCells)) {
    headerRow = 0
    const mapped = mapHeader(firstCells)
    if (mapped.x >= 0 && mapped.y >= 0 && mapped.z >= 0) {
      cols = mapped
    } else {
      warnings.push("Header parcial: se asume orden X,Y,Z.")
    }
  } else {
    // Sin header. Si hay >=4 columnas y la 1ª no es numérica ⇒ es un ID de punto.
    const n = firstCells.length
    const firstIsNumeric = !Number.isNaN(parseNumber(firstCells[0]))
    if (n >= 4 && !firstIsNumeric) cols = { x: 1, y: 2, z: 3 }
    else cols = { x: 0, y: 1, z: 2 }
  }

  const points: TopoPoint[] = []
  let skipped = 0
  for (let i = headerRow + 1 < 0 ? 0 : headerRow + 1; i < rawLines.length; i++) {
    if (i === headerRow) continue
    const cells = splitLine(rawLines[i], separator)
    if (cells.length <= Math.max(cols.x, cols.y, cols.z)) {
      skipped++
      continue
    }
    const x = parseNumber(cells[cols.x])
    const y = parseNumber(cells[cols.y])
    const z = parseNumber(cells[cols.z])
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
      skipped++
      continue
    }
    points.push({ x, y, z })
  }

  if (points.length === 0) {
    warnings.push("No se reconoció ningún punto (X,Y,Z) válido.")
  }
  if (skipped > 0) {
    warnings.push(`${skipped} fila(s) ignorada(s) por formato inválido.`)
  }

  return { points, headerRow, separator, skipped, warnings }
}

/** Serializa puntos o resultados a CSV descargable (separador coma, decimal punto). */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(esc).join(",")]
  for (const r of rows) lines.push(r.map(esc).join(","))
  return lines.join("\n")
}

/* ── Autoverificación (no la usa la página) ──────────────────────────────── */
export function __selfTest(): { ok: boolean; results: { name: string; ok: boolean; detail: string }[] } {
  const results: { name: string; ok: boolean; detail: string }[] = []

  // 1. Header ESTE,NORTE,COTA con ; y decimal por coma.
  {
    const txt = "ESTE;NORTE;COTA\n1000,50;2000,25;100,10\n1010,00;2000,00;101,50"
    const r = parseTopoCsv(txt)
    const ok =
      r.points.length === 2 &&
      Math.abs(r.points[0].x - 1000.5) < 1e-6 &&
      Math.abs(r.points[0].z - 100.1) < 1e-6 &&
      r.separator === ";"
    results.push({ name: "header ESTE;NORTE;COTA con decimal coma", ok, detail: JSON.stringify(r.points) })
  }

  // 2. Sin header, orden X,Y,Z separado por coma, decimal punto.
  {
    const txt = "0,0,100\n10,0,100\n0,10,100"
    const r = parseTopoCsv(txt)
    const ok = r.points.length === 3 && r.headerRow === -1 && r.points[1].x === 10
    results.push({ name: "sin header X,Y,Z coma", ok, detail: JSON.stringify(r.points) })
  }

  // 3. Header PUNTO,X,Y,Z con tab → columna PUNTO ignorada.
  {
    const txt = "PUNTO\tX\tY\tZ\nP1\t5\t6\t7\nP2\t8\t9\t10"
    const r = parseTopoCsv(txt)
    const ok = r.points.length === 2 && r.points[0].x === 5 && r.points[0].z === 7 && r.separator === "\t"
    results.push({ name: "header PUNTO,X,Y,Z con tab", ok, detail: JSON.stringify(r.points) })
  }

  // 4. parseNumber formatos mixtos.
  {
    const ok =
      parseNumber("1.234,56") === 1234.56 &&
      parseNumber("1,234.56") === 1234.56 &&
      parseNumber("12,5") === 12.5 &&
      parseNumber("100") === 100
    results.push({ name: "parseNumber es/us/decimal", ok, detail: `${parseNumber("1.234,56")} ${parseNumber("1,234.56")}` })
  }

  return { ok: results.every((r) => r.ok), results }
}
