// Analizador de Licitaciones — Demo Data
// Licitación Pública LP-001-2026-SEDAPAL
// Construcción PTAR Lima Norte — Fase II

export type ComplianceStatus = "cumple" | "verificar" | "incumple" | "na"
export type RiskLevel = "HIGH" | "MEDIUM" | "LOW"

// ─── Metadatos de la licitación ──────────────────────────────
export const licitacionMeta = {
  nombre: "Construcción PTAR Lima Norte — Fase II",
  proceso: "LP-001-2026-SEDAPAL",
  entidad: "SEDAPAL — Servicio de Agua Potable y Alcantarillado de Lima",
  sector: "Saneamiento",
  tipo: "Licitación Pública",
  objeto: "Construcción de Planta de Tratamiento de Aguas Residuales, capacidad 800 L/s, con emisor y obras complementarias",
  departamento: "Lima Metropolitana",
  distrito: "Carabayllo",
  valorReferencial: 48_320_000,
  moneda: "PEN",
  plazoEjecucion: 24, // meses
  fechaConvocatoria: "2026-05-15",
  fechaBuenaProForma: "2026-08-20",
  fechaEntregaOfertas: "2026-07-28",
  sistema: "OSCE · SEACE",
  expediente: "SEACE-2026-LP-001-SEDAPAL",
  totalPaginas: 47,
  tamanoArchivo: "3.2 MB",
  riesgoGlobal: "MEDIUM" as RiskLevel,
  compatibilidadGlobal: 79,
  alertasCount: 3,
}

// ─── Pasos del análisis IA ───────────────────────────────────
export const analysisSteps = [
  { id: "s1", label: "Cargando y procesando PDF",          detail: `${licitacionMeta.totalPaginas} páginas · ${licitacionMeta.tamanoArchivo}` },
  { id: "s2", label: "Identificando entidad y proceso",    detail: `SEDAPAL · ${licitacionMeta.proceso}` },
  { id: "s3", label: "Extrayendo valor referencial",       detail: "S/ 48,320,000 · Recursos Ordinarios + Endeudamiento" },
  { id: "s4", label: "Analizando requisitos técnicos",     detail: "23 requisitos técnicos identificados · 3 brechas" },
  { id: "s5", label: "Evaluando criterios de calificación",detail: "4 factores de evaluación · Precio: 60 puntos" },
  { id: "s6", label: "Detectando cláusulas de riesgo",     detail: "7 riesgos contractuales identificados" },
  { id: "s7", label: "Verificando garantías exigidas",     detail: "4 tipos de garantía · Monto total estimado: S/ 5,281,600" },
  { id: "s8", label: "Calculando compatibilidad empresa",  detail: `Compatibilidad: ${licitacionMeta.compatibilidadGlobal}% · ${licitacionMeta.alertasCount} brechas críticas` },
]

// ─── Compatibilidad por dimensión ───────────────────────────
export const compatibilidad = {
  global:         79,
  tecnico:        72,
  economico:      86,
  experiencia:    65,
  administrativo: 94,
  ambiental:      60,
}

export const radarData = [
  { dimension: "Técnico",        empresa: 72,  requerido: 100 },
  { dimension: "Económico",      empresa: 86,  requerido: 100 },
  { dimension: "Experiencia",    empresa: 65,  requerido: 100 },
  { dimension: "Administrativo", empresa: 94,  requerido: 100 },
  { dimension: "Ambiental",      empresa: 60,  requerido: 100 },
]

// ─── Requisitos ──────────────────────────────────────────────
export interface RequisitoItem {
  id: string
  description: string
  detail: string
  status: ComplianceStatus
  critical: boolean
  clausula?: string
}

export interface RequisitoGroup {
  id: string
  title: string
  category: "tecnico" | "economico" | "administrativo"
  items: RequisitoItem[]
}

export const requisitos: RequisitoGroup[] = [
  {
    id: "g1", title: "Personal Clave Requerido", category: "tecnico",
    items: [
      {
        id: "r01", critical: true, clausula: "Cláusula 3.1.a",
        description: "Residente de Obra",
        detail: "Ing. Civil o Sanitario · CIP habilitado · Mínimo 10 años de experiencia · Especialización en saneamiento",
        status: "cumple",
      },
      {
        id: "r02", critical: true, clausula: "Cláusula 3.1.b",
        description: "Especialista en Tratamiento de Aguas Residuales",
        detail: "Ing. Sanitario o Ambiental · Mínimo 5 años · Experiencia en PTARs de ≥300 L/s",
        status: "verificar",
      },
      {
        id: "r03", critical: false, clausula: "Cláusula 3.1.c",
        description: "Especialista en Geotecnia y Suelos",
        detail: "Ing. Civil · Mínimo 5 años · Estudios de suelo en proyectos de saneamiento",
        status: "verificar",
      },
      {
        id: "r04", critical: false, clausula: "Cláusula 3.1.d",
        description: "Especialista Electromecánico",
        detail: "Ing. Mecánico-Eléctrico · Mínimo 5 años · Equipos de bombeo y automatización",
        status: "incumple",
      },
      {
        id: "r05", critical: false, clausula: "Cláusula 3.1.e",
        description: "Especialista en Gestión Ambiental",
        detail: "Ing. Ambiental o afín · Mínimo 3 años · SEIA y EIA en saneamiento",
        status: "cumple",
      },
      {
        id: "r06", critical: false, clausula: "Cláusula 3.1.f",
        description: "Responsable de Seguridad y Salud Ocupacional",
        detail: "Ing. con certificación OHSAS/ISO 45001 · Mínimo 3 años en obras de similar envergadura",
        status: "cumple",
      },
    ],
  },
  {
    id: "g2", title: "Equipamiento Mínimo", category: "tecnico",
    items: [
      {
        id: "r07", critical: true, clausula: "Cláusula 3.2",
        description: "Laboratorio de control de calidad de agua",
        detail: "Acreditado por INACAL para análisis DBO5, DQO, SST, coliformes. Propio o contratado.",
        status: "incumple",
      },
      {
        id: "r08", critical: false, clausula: "Cláusula 3.2",
        description: "Equipos de topografía (GPS diferencial, nivel automático)",
        detail: "Estación total precisión 2\". Mínimo 2 equipos propios o alquilados con contrato.",
        status: "cumple",
      },
      {
        id: "r09", critical: false, clausula: "Cláusula 3.2",
        description: "Maquinaria de movimiento de tierras",
        detail: "Excavadora, retroexcavadora, compactadora. Propia o contrato acreditado.",
        status: "cumple",
      },
      {
        id: "r10", critical: false, clausula: "Cláusula 3.2",
        description: "Planta de concreto móvil",
        detail: "Capacidad mínima 20 m³/hora. Propia o alquilada con contrato vigente.",
        status: "verificar",
      },
    ],
  },
  {
    id: "g3", title: "Certificaciones de Calidad", category: "tecnico",
    items: [
      {
        id: "r11", critical: false, clausula: "Cláusula 3.3",
        description: "ISO 9001:2015 — Sistema de Gestión de Calidad",
        detail: "Certificación vigente. Auditoría de renovación al día. Aplicable a la UEN de construcción.",
        status: "cumple",
      },
      {
        id: "r12", critical: false, clausula: "Cláusula 3.3",
        description: "ISO 14001:2015 — Gestión Ambiental",
        detail: "Certificación en proceso de renovación. Presentar carta de compromiso si no está vigente.",
        status: "verificar",
      },
      {
        id: "r13", critical: false, clausula: "Cláusula 3.3",
        description: "ISO 45001:2018 — Seguridad y Salud Ocupacional",
        detail: "Antes OHSAS 18001. Certificación vigente o declaración jurada de implementación.",
        status: "cumple",
      },
    ],
  },
  {
    id: "g4", title: "Requisitos Económico-Financieros", category: "economico",
    items: [
      {
        id: "r14", critical: true, clausula: "Cláusula 4.1",
        description: "Capital de trabajo disponible",
        detail: "Mínimo S/ 9,664,000 (20% del valor referencial). Acreditar con estados financieros auditados 2025.",
        status: "cumple",
      },
      {
        id: "r15", critical: true, clausula: "Cláusula 4.2",
        description: "Facturación promedio anual — últimos 5 años",
        detail: "Facturación ≥ S/ 24,160,000/año (50% VR). Incluir obras públicas y privadas en saneamiento.",
        status: "verificar",
      },
      {
        id: "r16", critical: false, clausula: "Cláusula 4.3",
        description: "Línea de crédito bancaria disponible",
        detail: "Mínimo S/ 4,832,000 (10% VR). Carta de banco de primer nivel con vigencia mínima 60 días.",
        status: "cumple",
      },
      {
        id: "r17", critical: false, clausula: "Cláusula 4.4",
        description: "Patrimonio neto positivo",
        detail: "Estado financiero auditado 2025. Patrimonio neto ≥ S/ 12,080,000 (25% VR).",
        status: "cumple",
      },
    ],
  },
  {
    id: "g5", title: "Requisitos Administrativos y Legales", category: "administrativo",
    items: [
      {
        id: "r18", critical: true, clausula: "Cláusula 5.1",
        description: "Registro Nacional de Proveedores (RNP) vigente",
        detail: "Categoría E — Ejecutores de Obras. Inscripción actualizada. Capacidad máxima de contratación ≥ S/ 48,320,000.",
        status: "cumple",
      },
      {
        id: "r19", critical: true, clausula: "Cláusula 5.2",
        description: "Sin deuda exigible con SUNAT y SUNAFIL",
        detail: "Constancia de no adeudo. Fraccionamiento vigente se admite.",
        status: "cumple",
      },
      {
        id: "r20", critical: false, clausula: "Cláusula 5.3",
        description: "Declaración jurada de no impedimentos",
        detail: "Ningún representante legal con sentencia condenatoria ni inhabilitado por OSCE.",
        status: "cumple",
      },
      {
        id: "r21", critical: false, clausula: "Cláusula 5.4",
        description: "Plan de manejo ambiental (PMA)",
        detail: "Presentar PMA adaptado a la obra. Debe incluir gestión de lodos y efluentes durante construcción.",
        status: "verificar",
      },
      {
        id: "r22", critical: false, clausula: "Cláusula 5.5",
        description: "Seguro Complementario de Trabajo de Riesgo (SCTR)",
        detail: "Presentar póliza en la firma del contrato. Cobertura para todo el personal en obra.",
        status: "na",
      },
      {
        id: "r23", critical: false, clausula: "Cláusula 5.6",
        description: "Carta de intención de consorcio (si aplica)",
        detail: "Máximo 3 consorciados. Porcentaje mínimo de participación líder: 40%. No obligatorio si se postula solo.",
        status: "na",
      },
    ],
  },
]

// ─── Riesgos ─────────────────────────────────────────────────
export interface Riesgo {
  id: string
  titulo: string
  descripcion: string
  level: RiskLevel
  probability: string
  impacto: string
  mitigacion: string
  clausula?: string
  importeRiesgo?: string
  tipo: "contractual" | "tecnico" | "financiero" | "legal" | "ambiental"
}

export const riesgos: Riesgo[] = [
  {
    id: "rsk1", level: "HIGH", tipo: "tecnico",
    titulo: "Interferencias con redes existentes de SEDAPAL y terceros",
    descripcion: "El área de Carabayllo tiene alta densidad de redes de agua potable, alcantarillado, gas natural (Calidda) y electricidad (Enel). Las bases transfieren el 100% del riesgo de interferencias no documentadas al contratista.",
    probability: "Alta (80%)",
    impacto: "S/ 2,400,000 – S/ 4,800,000 en costos adicionales + 3–5 meses de ampliación",
    mitigacion: "Solicitar planos AS-BUILT actualizados a SEDAPAL antes de la oferta. Incluir partida contingencia de interferencias. Negociar cláusula de suspensión pagada.",
    clausula: "Cláusula 15 — Riesgos y responsabilidades",
    importeRiesgo: "S/ 2.4M – S/ 4.8M",
  },
  {
    id: "rsk2", level: "HIGH", tipo: "contractual",
    titulo: "Penalidades por mora — 0.10% diario sin tope explícito",
    descripcion: "Las bases establecen penalidad del 0.10% del contrato por día de retraso. Para un contrato de S/ 48.3M esto equivale a S/ 48,320/día. Las bases no establecen tope máximo, lo que podría generar penalidades ilimitadas en casos de fuerza mayor.",
    probability: "Media (45%)",
    impacto: "S/ 48,320 por día · Sin tope = riesgo ilimitado en el contrato",
    mitigacion: "Negociar en consultas a las bases que se incluya tope del 10% según Art. 133 del Reglamento. Revisar causales de ampliación de plazo.",
    clausula: "Cláusula 22 — Penalidades",
    importeRiesgo: "Hasta S/ 4,832,000 (tope 10%)",
  },
  {
    id: "rsk3", level: "HIGH", tipo: "ambiental",
    titulo: "Permisos ambientales y arqueológicos — ruta crítica",
    descripcion: "El terreno está en zona con potencial arqueológico según datos del Ministerio de Cultura. El Certificado de Inexistencia de Restos Arqueológicos (CIRA) puede tomar 6–12 meses adicionales. Las bases no consideran este riesgo en el cronograma.",
    probability: "Media-Alta (60%)",
    impacto: "Ampliación de plazo 3–6 meses. Sobrecosto de estudios: S/ 180,000 – S/ 320,000",
    mitigacion: "Verificar estado del CIRA antes de la oferta. Si no está obtenido por SEDAPAL, presentar consulta formal en las bases.",
    clausula: "Cláusula 8 — Documentos del expediente técnico",
    importeRiesgo: "S/ 180,000 – S/ 320,000",
  },
  {
    id: "rsk4", level: "MEDIUM", tipo: "financiero",
    titulo: "Variación de precios de acero — alta volatilidad 2026",
    descripcion: "El presupuesto incluye aproximadamente 2,800 TM de acero corrugado (S/ 9.7M). El acero ha tenido variaciones de ±18% en los últimos 12 meses. Las bases incluyen fórmulas de reajuste (Monomio K de acero), pero el índice tiene rezago de 2 meses.",
    probability: "Media (50%)",
    impacto: "Variación del 10% = S/ 970,000 adicionales o menores en el contrato",
    mitigacion: "Solicitar al proveedor de acero cotización en firme válida por 90 días. Analizar la fórmula de reajuste K de acero de las bases.",
    clausula: "Cláusula 19 — Reajuste de precios",
    importeRiesgo: "S/ 970,000 – S/ 1,940,000",
  },
  {
    id: "rsk5", level: "MEDIUM", tipo: "tecnico",
    titulo: "Estudio de mecánica de suelos desactualizado",
    descripcion: "El EMS del expediente data de 2023. Según el perfil del terreno en Carabayllo (zona 4, suelo aluvial), es posible encontrar nivel freático alto o suelos blandos que requieran mejoramiento. Las bases no contemplan previsiones para estas condiciones.",
    probability: "Media (40%)",
    impacto: "Mejoramiento de suelos: S/ 800,000 – S/ 1,500,000 adicionales",
    mitigacion: "Realizar sondaje propio antes de la oferta. Incluir en la propuesta un ítem de contingencia de mejoramiento de suelos.",
    clausula: "Estudio de Mecánica de Suelos — Anexo 12",
    importeRiesgo: "S/ 800,000 – S/ 1,500,000",
  },
  {
    id: "rsk6", level: "MEDIUM", tipo: "legal",
    titulo: "Disponibilidad parcial del terreno — ocupantes informales",
    descripcion: "El informe de disponibilidad del terreno indica 3 sectores con ocupantes informales (posesionarios) en proceso de notificación por SEDAPAL. La entrega del terreno podría ser parcial al inicio de la obra.",
    probability: "Media (35%)",
    impacto: "Inicio tardío en sectores afectados. Reprogramación de frentes de trabajo.",
    mitigacion: "Incluir en la oferta un plan de trabajo que permita iniciar por los sectores disponibles. Solicitar cronograma de liberación de terreno a SEDAPAL.",
    clausula: "Informe de Disponibilidad — Anexo 5",
    importeRiesgo: "Indirecto — impacto en plazo",
  },
  {
    id: "rsk7", level: "LOW", tipo: "contractual",
    titulo: "Adelanto directo limitado al 10%",
    descripcion: "El adelanto directo es del 10% (S/ 4,832,000). Para una obra de 24 meses con alta inversión inicial en equipos importados para la PTAR, este adelanto puede ser insuficiente para el flujo de caja de los primeros 3 meses.",
    probability: "Baja (25%)",
    impacto: "Presión sobre el flujo de caja — meses 1 a 4 de ejecución",
    mitigacion: "Asegurar línea de crédito bancaria antes de firmar el contrato. Negociar pagos quincenales de valorización.",
    clausula: "Cláusula 20 — Adelantos",
    importeRiesgo: "No aplica — riesgo financiero interno",
  },
]

// ─── Garantías ───────────────────────────────────────────────
export interface Garantia {
  id: string
  tipo: string
  descripcion: string
  monto: number
  montoPct: string
  plazo: string
  tipoDocumento: string
  momento: string
  nota?: string
}

export const garantias: Garantia[] = [
  {
    id: "g1",
    tipo: "Seriedad de Oferta",
    descripcion: "Garantiza que el postor mantendrá su oferta durante el proceso de selección.",
    monto: 483_200,
    montoPct: "1% del Valor Referencial",
    plazo: "Hasta firma de contrato + 30 días",
    tipoDocumento: "Carta fianza bancaria irrevocable, incondicional, solidaria, de realización automática",
    momento: "Con la presentación de la oferta",
    nota: "Banco de primer nivel supervisado por la SBS. No se admiten pólizas de caución.",
  },
  {
    id: "g2",
    tipo: "Fiel Cumplimiento del Contrato",
    descripcion: "Garantiza la correcta ejecución de todas las obligaciones contractuales.",
    monto: 4_832_000,
    montoPct: "10% del monto del contrato",
    plazo: "Vigencia del contrato + 90 días posteriores a la liquidación",
    tipoDocumento: "Carta fianza bancaria irrevocable, incondicional, solidaria, de ejecución automática",
    momento: "Previa a la firma del contrato",
    nota: "Se renueva cada año. Si el contrato supera el valor referencial en más del 10%, se exige garantía adicional por el diferencial.",
  },
  {
    id: "g3",
    tipo: "Adelanto Directo",
    descripcion: "Garantiza la correcta aplicación del adelanto directo otorgado por la entidad.",
    monto: 483_200,
    montoPct: "100% del monto del adelanto solicitado (máx. 10% del contrato)",
    plazo: "Hasta amortización total del adelanto en valorizaciones",
    tipoDocumento: "Carta fianza bancaria en las mismas condiciones que la de fiel cumplimiento",
    momento: "Previa a la entrega del adelanto",
    nota: "Se amortiza proporcionalmente con cada valorización. El contratista puede solicitar adelanto parcial.",
  },
  {
    id: "g4",
    tipo: "Adelanto para Materiales",
    descripcion: "Garantiza el uso específico de los materiales para los que se solicitó el adelanto.",
    monto: 1_932_800,
    montoPct: "100% del monto del adelanto de materiales (máx. 20% del contrato)",
    plazo: "Hasta amortización total en valorizaciones",
    tipoDocumento: "Carta fianza bancaria bajo las mismas condiciones",
    momento: "Previa a la entrega del adelanto de materiales",
    nota: "Requiere sustentación de necesidad de materiales específicos (equipos PTAR, tuberías HDPE, etc.).",
  },
]

// ─── Experiencia requerida ───────────────────────────────────
export interface ExperienciaItem {
  id: string
  titulo: string
  requisito: string
  detalle: string
  empresaEstado: string
  match: "cumple" | "verificar" | "incumple"
  clausula: string
  critical: boolean
}

export const experienciaRequerida: ExperienciaItem[] = [
  {
    id: "e1", critical: true, clausula: "Cláusula 6.1",
    titulo: "Experiencia en el objeto — obras similares",
    requisito: "Haber ejecutado como mínimo 2 contratos de obras de saneamiento (PTARs, PTAPs, sistemas de alcantarillado) por un monto acumulado ≥ S/ 24,160,000 (50% VR) en los últimos 10 años.",
    detalle: "Solo se aceptan contratos con recepción de obra conforme. Los consorcios acreditan en su porcentaje de participación.",
    empresaEstado: "Constructora ABC acredita 2 obras: Ampliación PTAR Lurín (S/12.8M, 2022) y Sistema de Alcantarillado Comas Fase I (S/9.4M, 2020). Total: S/22.2M. Brecha: S/1.96M (8%)",
    match: "verificar",
  },
  {
    id: "e2", critical: false, clausula: "Cláusula 6.2",
    titulo: "Experiencia en obra en general",
    requisito: "Haber ejecutado contratos de obra en general por un monto acumulado ≥ S/ 48,320,000 (100% VR) en los últimos 10 años.",
    detalle: "Se incluyen todo tipo de obras públicas y privadas. No se limita al sector saneamiento.",
    empresaEstado: "Constructora ABC acredita un portafolio de S/78.4M en obras ejecutadas en los últimos 10 años. Supera el requisito.",
    match: "cumple",
  },
  {
    id: "e3", critical: true, clausula: "Cláusula 6.3",
    titulo: "Experiencia del Residente de Obra",
    requisito: "Mínimo 10 años de experiencia general en obras civiles y mínimo 2 años como residente o jefe de obra en proyectos de saneamiento.",
    detalle: "Presentar CV documentado con contratos, certificados de trabajo y copias de cuadernos de obra firmados.",
    empresaEstado: "Ing. Ricardo Alvarado (propuesto) — 14 años de experiencia. 3 años como residente en PTAR Lurín y Alcantarillado Comas. Cumple plenamente.",
    match: "cumple",
  },
  {
    id: "e4", critical: true, clausula: "Cláusula 6.3",
    titulo: "Experiencia Especialista en Tratamiento de Aguas",
    requisito: "Mínimo 5 años de experiencia y haber participado en al menos 1 proyecto de PTAR con caudal de diseño ≥ 300 L/s.",
    detalle: "Presentar CV documentado. El profesional debe estar disponible a tiempo completo en obra.",
    empresaEstado: "No se tiene identificado un especialista con experiencia en PTARs de la envergadura requerida. Se debe contratar externamente o asociar en consorcio con empresa especialista.",
    match: "incumple",
  },
  {
    id: "e5", critical: false, clausula: "Cláusula 6.3",
    titulo: "Experiencia Especialista Electromecánico",
    requisito: "Mínimo 5 años de experiencia en instalación y comisionamiento de equipos electromecánicos en plantas de tratamiento.",
    detalle: "Específicamente bombas de caudal variable, sopladores de aireación y tableros SCADA.",
    empresaEstado: "No se cuenta con este perfil en planilla. Se requiere contratar un especialista externo con experiencia certificada en sistemas SCADA para plantas de tratamiento.",
    match: "incumple",
  },
  {
    id: "e6", critical: false, clausula: "Cláusula 6.4",
    titulo: "Experiencia Especialista en Gestión Ambiental",
    requisito: "Mínimo 3 años en proyectos con Instrumento de Gestión Ambiental (IGA) aprobado. Experiencia en proyectos categoría B+.",
    detalle: "El proyecto cuenta con Declaración de Impacto Ambiental (DIA). El especialista debe haber participado en la implementación de al menos 1 IGA de similar categoría.",
    empresaEstado: "Ing. Ana Soria (en planilla) — 6 años de experiencia ambiental, incluyendo 2 proyectos de saneamiento con DIA aprobada por SENACE. Cumple plenamente.",
    match: "cumple",
  },
]

// ─── Criterios de evaluación ──────────────────────────────────
export const criteriosEvaluacion = [
  { factor: "Precio de la oferta",              puntaje: 60, tipo: "económico" },
  { factor: "Experiencia en el objeto",         puntaje: 20, tipo: "técnico" },
  { factor: "Propuesta técnico-metodológica",   puntaje: 15, tipo: "técnico" },
  { factor: "Certificaciones de gestión",       puntaje: 5,  tipo: "técnico" },
]

// ─── Estadísticas del análisis ───────────────────────────────
export const analysisStats = {
  cumple:    10,
  verificar:  7,
  incumple:   3,
  na:         3,
  totalRequisitos: 23,
  riesgosHigh:   3,
  riesgosMedium: 3,
  riesgosLow:    1,
  garantiasTotal: garantias.reduce((s, g) => s + g.monto, 0),
}
