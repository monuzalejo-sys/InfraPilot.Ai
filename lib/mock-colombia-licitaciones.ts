// 10 Licitaciones — Constructora Andina S.A.S.
// Procesos activos en SECOP II · Colombia · 2026
// Marco legal: Ley 80/1993, Ley 1150/2007, Decreto 1082/2015

export type LicitacionStatus = "EN_ESTUDIO" | "OFERTA_PREPARADA" | "PRESENTADA" | "ADJUDICADA" | "DESIERTA" | "DESCARTADA"
export type RiesgoNivel = "ALTO" | "MEDIO" | "BAJO"

export interface LicitacionRequisito { id: string; descripcion: string; estado: "cumple" | "verificar" | "incumple"; critico: boolean }
export interface LicitacionRiesgo    { id: string; titulo: string; nivel: RiesgoNivel; mitigacion: string }
export interface CriterioEval        { factor: string; puntos: number; tipo: "economico" | "tecnico" | "habilitante" }

export interface Licitacion {
  id:               string
  proceso:          string
  nombre:           string
  objeto:           string
  entidad:          string
  sector:           string
  ciudad:           string
  departamento:     string
  tipo:             string
  modalidad:        string
  secopUrl:         string
  valorReferencial: number             // COP
  presupuesto:      number             // COP (incluye AIU e IGV si aplica)
  plazoMeses:       number
  // Fechas clave
  fechaPublicacion: string
  fechaBuenaProForma: string
  fechaOfertas:     string
  fechaAdjudicacion:string
  // Capacidad residual
  kRequeridoSMMLV:  number
  kRequeridoCOP:    number
  // Estado en el pipeline de la empresa
  status:           LicitacionStatus
  compatibilidad:   number             // %
  riesgoGlobal:     RiesgoNivel
  // Análisis
  requisitos:       LicitacionRequisito[]
  riesgos:          LicitacionRiesgo[]
  criterios:        CriterioEval[]
  // Garantías exigidas (COP)
  garantiaSeriedad: number
  garantiaFielCumplimiento: number
  // IA
  resumenIA:        string
  recomendacionIA:  "PARTICIPAR" | "VERIFICAR" | "DESCARTAR"
  puntajeIA:        number             // /100
}

// SMLMV 2026 = $1.423.500 COP
const SMLMV = 1_423_500

export const licitaciones: Licitacion[] = [
  // ─────────────────────────────────────────────────────────────
  {
    id:"L01", proceso:"LP-IDU-031-2026",
    nombre:"Rehabilitación y Mejoramiento Av. Boyacá entre Calle 80 y Calle 100 — Tramo Norte",
    objeto:"Rehabilitación de 4.8 km de la Av. Boyacá en doble calzada: fresado, reposición de capas asfálticas MDC-19, mejoramiento de andenes, construcción de cicloruta, redes de alcantarillado pluvial y señalización.",
    entidad:"IDU — Instituto de Desarrollo Urbano", sector:"Vías y Transporte",
    ciudad:"Bogotá D.C.", departamento:"Cundinamarca",
    tipo:"Licitación Pública", modalidad:"Precio Global con Fórmula de Reajuste",
    secopUrl:"secop2.gov.co/LP-IDU-031-2026",
    valorReferencial:24_580_000_000, presupuesto:24_580_000_000,
    plazoMeses:18,
    fechaPublicacion:"2026-05-10", fechaBuenaProForma:"2026-07-25", fechaOfertas:"2026-07-15", fechaAdjudicacion:"2026-08-05",
    kRequeridoSMMLV:17_267, kRequeridoCOP:24_580_000_000*0.70,
    status:"EN_ESTUDIO", compatibilidad:88, riesgoGlobal:"BAJO",
    requisitos:[
      { id:"R1", descripcion:"RUP vigente Cámara de Comercio · Cat. Civil · Subcategoría Vías",           estado:"cumple",    critico:true  },
      { id:"R2", descripcion:"Experiencia en obras similares (vías): mínimo $12.290M acumulados 10 años", estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Facturación promedio anual ≥ $12.290M últimos 5 años",                       estado:"cumple",    critico:true  },
      { id:"R4", descripcion:"Capital de trabajo: 20% del VR = $4.916M (estados financieros 2025)",       estado:"cumple",    critico:true  },
      { id:"R5", descripcion:"Residente: Ing. Civil · ≥8 años experiencia · ≥2 en vías urbanas",          estado:"cumple",    critico:false },
      { id:"R6", descripcion:"Especialista señalización vial certificado (SIT)",                           estado:"verificar", critico:false },
      { id:"R7", descripcion:"ISO 9001:2015 vigente",                                                      estado:"cumple",    critico:false },
      { id:"R8", descripcion:"Sin sanciones disciplinarias vigentes (SIRI-SIIC)",                          estado:"cumple",    critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"MEDIO", titulo:"Interferencias con redes Codensa y ETB en corredor", mitigacion:"Solicitar estudios de interferencias antes de oferta. Incluir partida contingencia 3%." },
      { id:"RS2", nivel:"BAJO",  titulo:"Restricción de tráfico en zona de alta afluencia",  mitigacion:"Incluir plan de manejo de tráfico detallado. Trabajo nocturno para carriles principales." },
      { id:"RS3", nivel:"BAJO",  titulo:"Variación precio asfalto MDC-19",                    mitigacion:"Fórmulas de reajuste incluidas en las bases. Cotización firme a proveedor 60 días." },
    ],
    criterios:[
      { factor:"Oferta económica",           puntos:70, tipo:"economico" },
      { factor:"Experiencia en obras similares",puntos:20,tipo:"tecnico"  },
      { factor:"Propuesta técnico-metodológica",puntos:10,tipo:"tecnico" },
    ],
    garantiaSeriedad:       491_600_000,
    garantiaFielCumplimiento:2_458_000_000,
    resumenIA:"Licitación altamente compatible con el perfil de la empresa. Constructora Andina cumple todos los requisitos habilitantes, el único ítem a verificar es la certificación del especialista en señalización SIT. El corredor Boyacá es conocido — la empresa ejecutó trabajos similares en Av. Ciudad de Cali (VIA-BOG-001). Riesgo bajo. Se recomienda participar con una oferta de descuento del 6-9% sobre el VR.",
    recomendacionIA:"PARTICIPAR", puntajeIA:91,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L02", proceso:"LP-INVIAS-184-2026",
    nombre:"Pavimentación y Rehabilitación Ruta 45A Bucaramanga–Cúcuta km 58–120",
    objeto:"Pavimentación de 62 km de carretera nacional en pavimento flexible MDC-19 y MDC-25, incluyendo obras de drenaje, manejo de taludes, puentes menores y señalización vial, en la Ruta Nacional 45A.",
    entidad:"INVIAS — Instituto Nacional de Vías · Regional Santander", sector:"Infraestructura Vial Nacional",
    ciudad:"Bucaramanga", departamento:"Santander",
    tipo:"Licitación Pública", modalidad:"Precios Unitarios con Reajuste INVIAS",
    secopUrl:"secop2.gov.co/LP-INVIAS-184-2026",
    valorReferencial:85_400_000_000, presupuesto:85_400_000_000,
    plazoMeses:30,
    fechaPublicacion:"2026-04-28", fechaBuenaProForma:"2026-08-10", fechaOfertas:"2026-07-28", fechaAdjudicacion:"2026-08-25",
    kRequeridoSMMLV:59_708, kRequeridoCOP:85_400_000_000*0.70,
    status:"DESCARTADA", compatibilidad:38, riesgoGlobal:"ALTO",
    requisitos:[
      { id:"R1", descripcion:"Capacidad residual K ≥ $59.780M — supera la capacidad actual de la empresa ($85B)", estado:"incumple", critico:true },
      { id:"R2", descripcion:"Experiencia en obras viales: ≥$42.700M acumulados en últimos 10 años",             estado:"incumple", critico:true },
      { id:"R3", descripcion:"RUP vigente con clasificación vías primarias",                                      estado:"cumple",   critico:false },
      { id:"R4", descripcion:"Patrimonio neto ≥ $21.350M (25% VR)",                                              estado:"verificar",critico:true },
    ],
    riesgos:[
      { id:"RS1", nivel:"ALTO", titulo:"Capacidad residual insuficiente sin consorcio", mitigacion:"Sólo viable en consorcio con empresa de mayor capacidad. No recomendado." },
      { id:"RS2", nivel:"ALTO", titulo:"Experiencia acumulada insuficiente en obras de esta escala", mitigacion:"Brecha de $18.000M en experiencia requerida." },
    ],
    criterios:[
      { factor:"Oferta económica",             puntos:60, tipo:"economico" },
      { factor:"Experiencia en el objeto",     puntos:25, tipo:"tecnico"  },
      { factor:"Propuesta técnico-ambiental",  puntos:15, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       1_708_000_000,
    garantiaFielCumplimiento:8_540_000_000,
    resumenIA:"Licitación descartada. El valor referencial de $85.400M supera ampliamente la capacidad residual actual de la empresa ($85.000M K máximo). La experiencia acumulada en obras viales del mismo tipo ($22.800M) no alcanza el mínimo requerido ($42.700M). No se recomienda participar ni siquiera en consorcio dado el perfil de riesgo alto.",
    recomendacionIA:"DESCARTAR", puntajeIA:22,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L03", proceso:"LP-EAAB-014-2026",
    nombre:"Interceptor Norte de Bogotá — Tramo 3 (Calle 134 a Calle 170)",
    objeto:"Construcción de 6.2 km de colector interceptor de aguas residuales DN800 a DN1200 en HDPE y concreto reforzado, incluyendo 42 cámaras de inspección, conexiones domiciliarias y obras complementarias de la EAAB.",
    entidad:"EAAB ESP — Empresa de Acueducto, Alcantarillado y Aseo de Bogotá", sector:"Acueducto y Alcantarillado",
    ciudad:"Bogotá D.C.", departamento:"Cundinamarca",
    tipo:"Licitación Pública", modalidad:"Precio Global con Interventoría",
    secopUrl:"secop2.gov.co/LP-EAAB-014-2026",
    valorReferencial:42_180_000_000, presupuesto:42_180_000_000,
    plazoMeses:24,
    fechaPublicacion:"2026-03-20", fechaBuenaProForma:"2026-06-30", fechaOfertas:"2026-06-20", fechaAdjudicacion:"2026-07-15",
    kRequeridoSMMLV:29_527, kRequeridoCOP:42_180_000_000*0.70,
    status:"PRESENTADA", compatibilidad:71, riesgoGlobal:"MEDIO",
    requisitos:[
      { id:"R1", descripcion:"Experiencia en redes de acueducto y alcantarillado ≥$21.090M",              estado:"verificar", critico:true  },
      { id:"R2", descripcion:"RUP vigente Subcategoría: Acueducto y Alcantarillado",                       estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Capital de trabajo ≥ $8.436M",                                               estado:"cumple",    critico:true  },
      { id:"R4", descripcion:"Director de obra: Ing. Civil/Sanitario ≥12 años, ≥3 en redes grandes",     estado:"cumple",    critico:false },
      { id:"R5", descripcion:"Especialista en suelos y geotecnia (tuberías hincadas DN>600)",              estado:"verificar", critico:false },
      { id:"R6", descripcion:"Laboratorio de ensayos de tuberías acreditado ONAC",                        estado:"incumple",  critico:false },
      { id:"R7", descripcion:"ISO 14001:2015 vigente",                                                     estado:"cumple",    critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"ALTO",  titulo:"Instalación por hincado en zonas de alto tráfico (Av. Suba, Av. Boyacá)", mitigacion:"Incluir metodología de hinca hidráulica. Aumentar contingencia de interferencias al 5%." },
      { id:"RS2", nivel:"MEDIO", titulo:"Laboratorio acreditado — se debe subcontratar a ONAC",           mitigacion:"Identificar laboratorio ONAC previo a la oferta. Incluir costo en overhead." },
      { id:"RS3", nivel:"MEDIO", titulo:"Experiencia acumulada: brecha estimada $4.500M",                 mitigacion:"Revisar contratos ejecutados ACU-CAL-003 y ACU-BUC-008 para certificar montos." },
    ],
    criterios:[
      { factor:"Menor valor oferta",           puntos:60, tipo:"economico" },
      { factor:"Experiencia en el objeto",     puntos:20, tipo:"tecnico"  },
      { factor:"Equipo de trabajo clave",      puntos:10, tipo:"tecnico"  },
      { factor:"Certificaciones ambientales",  puntos:10, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       843_600_000,
    garantiaFielCumplimiento:4_218_000_000,
    resumenIA:"Oferta presentada en plazo. La brecha en experiencia acumulada es manejable — se acreditaron los proyectos ACU-CAL-003 (EMCALI, $5.630M) y ACU-BUC-008 (AMB, fracción ejecutada $4.476M). El laboratorio ONAC fue resuelto con subcontrato a CONCRELAB Bogotá. Se presentó oferta con descuento del 7.2% = $39.140M. Awaiting adjudicación: 15 de julio.",
    recomendacionIA:"PARTICIPAR", puntajeIA:74,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L04", proceso:"LP-EPM-035-2026",
    nombre:"Subestación Eléctrica Rionegro 115/33 kV y Redes de Distribución",
    objeto:"Construcción de subestación eléctrica de 115/33 kV en el municipio de Rionegro, incluyendo obra civil de la subestación, canalizaciones, redes de distribución aérea y subterránea 33kV, 22 km de extensión.",
    entidad:"EPM — Empresas Públicas de Medellín", sector:"Energía Eléctrica",
    ciudad:"Rionegro", departamento:"Antioquia",
    tipo:"Licitación Pública", modalidad:"Contrato EPC (Ingeniería, Procura y Construcción)",
    secopUrl:"secop2.gov.co/LP-EPM-035-2026",
    valorReferencial:28_450_000_000, presupuesto:28_450_000_000,
    plazoMeses:20,
    fechaPublicacion:"2026-05-02", fechaBuenaProForma:"2026-08-15", fechaOfertas:"2026-08-05", fechaAdjudicacion:"2026-09-01",
    kRequeridoSMMLV:19_915, kRequeridoCOP:28_450_000_000*0.70,
    status:"DESCARTADA", compatibilidad:24, riesgoGlobal:"ALTO",
    requisitos:[
      { id:"R1", descripcion:"Experiencia en obras de infraestructura eléctrica de alta tensión ≥115kV",  estado:"incumple", critico:true  },
      { id:"R2", descripcion:"Acreditación RETIE para subestaciones de alta tensión",                      estado:"incumple", critico:true  },
      { id:"R3", descripcion:"Personal con certificación RETIE Alta Tensión (AT) vigente",                estado:"incumple", critico:true  },
    ],
    riesgos:[
      { id:"RS1", nivel:"ALTO", titulo:"Sin experiencia en construcción de subestaciones eléctricas AT", mitigacion:"No aplica — descartado." },
    ],
    criterios:[
      { factor:"Oferta económica",                    puntos:55, tipo:"economico" },
      { factor:"Experiencia en el objeto (EPC)",      puntos:30, tipo:"tecnico"  },
      { factor:"Plan de calidad y RETIE",             puntos:15, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       569_000_000,
    garantiaFielCumplimiento:2_845_000_000,
    resumenIA:"Licitación descartada. Esta licitación es de infraestructura eléctrica de alta tensión (115/33 kV), especialidad fuera del portafolio de Constructora Andina. No se cuenta con la acreditación RETIE AT ni experiencia certificada en subestaciones. El perfil técnico requerido no corresponde a las capacidades de la empresa.",
    recomendacionIA:"DESCARTAR", puntajeIA:12,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L05", proceso:"SA-FINDETER-028-2026",
    nombre:"Mejoramiento Sistema de Acueducto — Subregión Montes de María (7 Municipios)",
    objeto:"Construcción y mejoramiento de sistemas de acueducto en 7 municipios de los Montes de María (Bolívar y Sucre): redes de distribución, tanques de almacenamiento, sistemas de bombeo solar y conexiones domiciliarias para 18.500 usuarios.",
    entidad:"FINDETER — Financiera de Desarrollo Territorial S.A.", sector:"Agua Potable Rural",
    ciudad:"El Carmen de Bolívar", departamento:"Bolívar / Sucre",
    tipo:"Selección Abreviada", modalidad:"Menor Cuantía Calificada",
    secopUrl:"secop2.gov.co/SA-FINDETER-028-2026",
    valorReferencial:12_840_000_000, presupuesto:12_840_000_000,
    plazoMeses:16,
    fechaPublicacion:"2026-05-22", fechaBuenaProForma:"2026-07-18", fechaOfertas:"2026-07-10", fechaAdjudicacion:"2026-07-28",
    kRequeridoSMMLV:9_006,  kRequeridoCOP:12_840_000_000*0.70,
    status:"OFERTA_PREPARADA", compatibilidad:79, riesgoGlobal:"MEDIO",
    requisitos:[
      { id:"R1", descripcion:"RUP vigente Subcategoría: Redes de acueducto y alcantarillado",           estado:"cumple",    critico:true  },
      { id:"R2", descripcion:"Experiencia en sistemas de acueducto rural ≥$6.420M en 10 años",         estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Capital de trabajo ≥ $2.568M",                                            estado:"cumple",    critico:true  },
      { id:"R4", descripcion:"Experiencia en sistemas de bombeo solar fotovoltaico",                    estado:"verificar", critico:false },
      { id:"R5", descripcion:"Coordinador social (Lic. en trabajo social o ciencias sociales)",        estado:"cumple",    critico:false },
      { id:"R6", descripcion:"Plan de Gestión Ambiental adaptado a zona PDET",                         estado:"cumple",    critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"MEDIO", titulo:"Logística en zona rural dispersa — 7 municipios, vías terciarias", mitigacion:"Incluir cuadrillas móviles y campamentos temporales. Aumento overhead logístico +8%." },
      { id:"RS2", nivel:"MEDIO", titulo:"Sistemas de bombeo solar sin experiencia certificada",            mitigacion:"Subcontratar a empresa especialista en solar para componente fotovoltaico." },
      { id:"RS3", nivel:"BAJO",  titulo:"Orden público — zona históricamente compleja",                   mitigacion:"Protocolo de seguridad con consulta a autoridades locales y APC-Colombia." },
    ],
    criterios:[
      { factor:"Menor valor oferta",        puntos:70, tipo:"economico" },
      { factor:"Experiencia en el objeto",  puntos:20, tipo:"tecnico"  },
      { factor:"Componente social",         puntos:10, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       256_800_000,
    garantiaFielCumplimiento:1_284_000_000,
    resumenIA:"Oferta en preparación. La empresa cumple los requisitos habilitantes principales. La única brecha es la experiencia en bombeo solar — se planea subcontratar a ENERTEC Solar para ese componente. Licitación estratégica: zona PDET con beneficio tributario en impuesto de renta. Oferta sugerida: $11.900M (descuento 7.3%). Fecha límite presentación: 10 de julio.",
    recomendacionIA:"PARTICIPAR", puntajeIA:80,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L06", proceso:"LP-TM-007-2026",
    nombre:"Estación Intermedia Portal Américas — Sistema Transmilenio Fase IV",
    objeto:"Construcción de estación de Transmilenio, incluye estructura en concreto 35 MPa, cubierta metálica de 1.200 m², accesos peatonales, plataforma y torniquetes, redes eléctricas y de datos, urbanismo y señalización.",
    entidad:"Transmilenio S.A.", sector:"Transporte Público Masivo",
    ciudad:"Bogotá D.C.", departamento:"Cundinamarca",
    tipo:"Licitación Pública", modalidad:"Global sin Fórmula de Reajuste",
    secopUrl:"secop2.gov.co/LP-TM-007-2026",
    valorReferencial:31_680_000_000, presupuesto:31_680_000_000,
    plazoMeses:22,
    fechaPublicacion:"2026-04-15", fechaBuenaProForma:"2026-07-20", fechaOfertas:"2026-07-08", fechaAdjudicacion:"2026-08-01",
    kRequeridoSMMLV:22_194, kRequeridoCOP:31_680_000_000*0.70,
    status:"EN_ESTUDIO", compatibilidad:65, riesgoGlobal:"MEDIO",
    requisitos:[
      { id:"R1", descripcion:"Experiencia en construcción de estaciones de metro, BRT o similares ≥$15.840M", estado:"verificar", critico:true  },
      { id:"R2", descripcion:"RUP Subcategoría: Edificaciones y obras civiles especiales",                    estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Capital de trabajo ≥ $6.336M",                                                  estado:"cumple",    critico:true  },
      { id:"R4", descripcion:"Especialista en estructuras metálicas con 5+ años en cubierta autoportante",    estado:"verificar", critico:false },
      { id:"R5", descripcion:"Plan de manejo de tráfico para corredor Av. Américas (alto volumen)",           estado:"cumple",    critico:false },
      { id:"R6", descripcion:"Sistema de gestión de calidad certificado ISO 9001",                            estado:"cumple",    critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"MEDIO", titulo:"Restricción de obra en corredor operativo de Transmilenio",        mitigacion:"Cronograma de obra nocturna aprobado por TM. Multas por interrupción del servicio." },
      { id:"RS2", nivel:"MEDIO", titulo:"Experiencia en estaciones BRT — posible brecha de $3.000M",       mitigacion:"Incluir en experiencia el Centro Comercial Fontibón Plaza (similitud estructural). Consultar con TM." },
      { id:"RS3", nivel:"BAJO",  titulo:"Cubierta metálica autoportante — especialidad",                    mitigacion:"Incluir APU-024 (cerchas) y subcontratar serrería especializada si se requiere." },
    ],
    criterios:[
      { factor:"Menor valor oferta",             puntos:60, tipo:"economico" },
      { factor:"Experiencia en estaciones",      puntos:25, tipo:"tecnico"  },
      { factor:"Metodología constructiva",       puntos:15, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       633_600_000,
    garantiaFielCumplimiento:3_168_000_000,
    resumenIA:"Licitación en estudio. La principal brecha es la experiencia específica en estaciones de BRT o metro — la empresa no tiene contratos certificados en este subtipo exacto. Sin embargo, el Centro Comercial Fontibón Plaza (EDI-BOG-007) tiene similitudes estructurales (cubierta metálica autoportante, cimentación profunda). Se recomienda consultar a Transmilenio si este tipo de obra es aceptable como referencia antes de decidir participar.",
    recomendacionIA:"VERIFICAR", puntajeIA:62,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L07", proceso:"LP-MVCT-012-2026",
    nombre:"Macroproyecto VIS Ciudadela Nuevo Occidente — 1.200 Unidades Fase IV",
    objeto:"Construcción de 1.200 apartamentos VIS de 52 m² en 8 torres de 15 pisos, macroproyecto Ciudadela Nuevo Occidente de Bogotá, estructura en concreto industrializado con túnel trepante, redes de servicios e infraestructura vial interna.",
    entidad:"Ministerio de Vivienda, Ciudad y Territorio / Metrovivienda", sector:"Vivienda de Interés Social",
    ciudad:"Bogotá D.C.", departamento:"Cundinamarca",
    tipo:"Licitación Pública", modalidad:"Precio Global con Hitos de Pago",
    secopUrl:"secop2.gov.co/LP-MVCT-012-2026",
    valorReferencial:67_200_000_000, presupuesto:67_200_000_000,
    plazoMeses:38,
    fechaPublicacion:"2026-05-28", fechaBuenaProForma:"2026-09-15", fechaOfertas:"2026-09-01", fechaAdjudicacion:"2026-09-30",
    kRequeridoSMMLV:47_069, kRequeridoCOP:67_200_000_000*0.70,
    status:"EN_ESTUDIO", compatibilidad:51, riesgoGlobal:"ALTO",
    requisitos:[
      { id:"R1", descripcion:"Capacidad residual K ≥ $47.069M — limita capacidad actual",                 estado:"verificar", critico:true  },
      { id:"R2", descripcion:"Experiencia en VIS/VIP ≥ 5.000 unidades acumuladas en 10 años",            estado:"incumple",  critico:true  },
      { id:"R3", descripcion:"Experiencia en edificaciones ≥ $33.600M",                                  estado:"cumple",    critico:true  },
      { id:"R4", descripcion:"Tecnología industrializada: formaleta túnel trepante o similar",           estado:"verificar", critico:false },
      { id:"R5", descripcion:"Director de proyectos VIS con 10 años y 3+ proyectos masivos",             estado:"verificar", critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"ALTO",  titulo:"Brecha en experiencia en VIS masiva (acumulado empresa: ~550 unidades)", mitigacion:"Sólo viable en consorcio con empresa especialista en VIS masiva (AMARILO, Constructora Bolívar)." },
      { id:"RS2", nivel:"ALTO",  titulo:"Capacidad residual en el límite superior con proyectos activos", mitigacion:"Revisar liberación de K al completar ACU-CAL-003 y VIV-ANT-013. Posible espera." },
      { id:"RS3", nivel:"MEDIO", titulo:"Escasez de formaletas túnel — requieren importación o alquiler de largo plazo", mitigacion:"Cotizar con DOKA o ULMA para alquiler de sistema túnel en 38 meses." },
    ],
    criterios:[
      { factor:"Menor valor oferta",                  puntos:60, tipo:"economico" },
      { factor:"Experiencia en VIS/VIP (unidades)",   puntos:25, tipo:"tecnico"  },
      { factor:"Sistema de construcción industrializado",puntos:15,tipo:"tecnico" },
    ],
    garantiaSeriedad:       1_344_000_000,
    garantiaFielCumplimiento:6_720_000_000,
    resumenIA:"Alta complejidad. El valor referencial de $67.200M y la exigencia de experiencia en 5.000 unidades VIS superan el perfil actual de la empresa (550 unidades VIS ejecutadas). Se requeriría un consorcio estratégico con un operador masivo de VIS. Evaluar en etapa de precalificación si aplica la modalidad de consorcio. Decisión: en estudio pendiente de análisis de consorcio.",
    recomendacionIA:"VERIFICAR", puntajeIA:48,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L08", proceso:"LP-DAGMA-CAL-009-2026",
    nombre:"Parques Lineales y Cicloruta Río Cali — Tramo Sur-Norte 14 km",
    objeto:"Construcción de parques lineales a orillas del Río Cali y cicloruta de 14 km, incluyendo senderos en adoquín, mobiliario urbano, arborización, iluminación LED solar, puentes peatonales y obras de manejo hídrico.",
    entidad:"DAGMA — Departamento Administrativo de Gestión del Medio Ambiente, Cali", sector:"Medio Ambiente y Espacio Público",
    ciudad:"Cali", departamento:"Valle del Cauca",
    tipo:"Licitación Pública", modalidad:"Precio Global",
    secopUrl:"secop2.gov.co/LP-DAGMA-CAL-009-2026",
    valorReferencial:16_450_000_000, presupuesto:16_450_000_000,
    plazoMeses:18,
    fechaPublicacion:"2026-06-01", fechaBuenaProForma:"2026-08-22", fechaOfertas:"2026-08-12", fechaAdjudicacion:"2026-09-05",
    kRequeridoSMMLV:11_527, kRequeridoCOP:16_450_000_000*0.70,
    status:"EN_ESTUDIO", compatibilidad:83, riesgoGlobal:"BAJO",
    requisitos:[
      { id:"R1", descripcion:"RUP vigente Subcategoría: Espacio público, vías peatonales y ciclovías",   estado:"cumple",    critico:true  },
      { id:"R2", descripcion:"Experiencia en obras de espacio público y/o cicloruta ≥$8.225M",           estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Especialista ambiental para manejo de ronda hídrica (Ley 99)",             estado:"cumple",    critico:false },
      { id:"R4", descripcion:"Arborización: Ingeniero agrónomo o biólogo (mín. 3 años)",                 estado:"verificar", critico:false },
      { id:"R5", descripcion:"ISO 14001:2015 vigente",                                                   estado:"cumple",    critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"BAJO", titulo:"Remoción de estructuras informales en ronda del río", mitigacion:"Coordinación previa con Alcaldía de Cali y DAGMA para desocupación." },
      { id:"RS2", nivel:"BAJO", titulo:"Gestión de residuos sólidos en zona de parque",      mitigacion:"Plan de gestión de residuos incluido en propuesta técnica." },
    ],
    criterios:[
      { factor:"Menor valor oferta",                  puntos:65, tipo:"economico" },
      { factor:"Experiencia en parques y ciclovías",  puntos:20, tipo:"tecnico"  },
      { factor:"Propuesta de arborización y paisajismo",puntos:15,tipo:"tecnico" },
    ],
    garantiaSeriedad:       329_000_000,
    garantiaFielCumplimiento:1_645_000_000,
    resumenIA:"Muy buena compatibilidad. La empresa tiene experiencia en espacio público y andenes (VIA-BOG-001, VIA-MAN-009) y cumple todos los habilitantes excepto el ingeniero agrónomo — se puede contratar por obra. La licitación es de tamaño adecuado ($16.450M) y riesgo bajo. Oferta sugerida con 8% de descuento = $15.134M. Se recomienda participar.",
    recomendacionIA:"PARTICIPAR", puntajeIA:85,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L09", proceso:"LP-GOB-BOY-022-2026",
    nombre:"Construcción Polideportivo Cubierto Municipal — Sogamoso, Boyacá",
    objeto:"Construcción de polideportivo cubierto de 4.200 m², incluye cancha múltiple FIFA, graderías para 1.800 espectadores, camerinos, cubierta metálica autoportante, instalaciones deportivas, parqueadero y cerramiento.",
    entidad:"Gobernación de Boyacá — Secretaría de Deporte", sector:"Equipamiento Deportivo",
    ciudad:"Sogamoso", departamento:"Boyacá",
    tipo:"Licitación Pública", modalidad:"Precios Unitarios",
    secopUrl:"secop2.gov.co/LP-GOB-BOY-022-2026",
    valorReferencial:9_850_000_000, presupuesto:9_850_000_000,
    plazoMeses:20,
    fechaPublicacion:"2026-05-15", fechaBuenaProForma:"2026-07-30", fechaOfertas:"2026-07-22", fechaAdjudicacion:"2026-08-10",
    kRequeridoSMMLV:6_900, kRequeridoCOP:9_850_000_000*0.70,
    status:"ADJUDICADA", compatibilidad:92, riesgoGlobal:"BAJO",
    requisitos:[
      { id:"R1", descripcion:"Experiencia en edificaciones deportivas o similares ≥$4.925M",            estado:"cumple",   critico:true  },
      { id:"R2", descripcion:"RUP vigente Subcategoría: Edificaciones",                                  estado:"cumple",   critico:true  },
      { id:"R3", descripcion:"Capital de trabajo ≥ $1.970M",                                             estado:"cumple",   critico:true  },
      { id:"R4", descripcion:"Cubierta metálica: Especialista con ≥3 proyectos de cubierta autoportante",estado:"cumple",   critico:false },
      { id:"R5", descripcion:"ISO 9001:2015 vigente",                                                    estado:"cumple",   critico:false },
      { id:"R6", descripcion:"SGSST certificado con tasa accidentalidad < 3%",                           estado:"cumple",   critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"BAJO", titulo:"Altitud de Sogamoso (2.569 msnm) afecta rendimiento de concreto", mitigacion:"Usar aditivos para concreto en altura. Ajustar diseño de mezcla." },
      { id:"RS2", nivel:"BAJO", titulo:"Transporte de estructura metálica desde Bogotá",                   mitigacion:"Cotizar fabricación local en Duitama. Plan de transporte especial." },
    ],
    criterios:[
      { factor:"Menor valor oferta",              puntos:70, tipo:"economico" },
      { factor:"Experiencia en el objeto",        puntos:20, tipo:"tecnico"  },
      { factor:"Plan calidad + SGSST",            puntos:10, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       197_000_000,
    garantiaFielCumplimiento:985_000_000,
    resumenIA:"ADJUDICADA. Constructora Andina fue seleccionada con oferta de $9.168M (descuento 6.9%). Firma del contrato prevista para el 25 de agosto de 2026. Acta de inicio: 1 de septiembre de 2026. Director asignado: Ing. Gustavo Morales. Este proyecto refuerza el portafolio de equipamiento deportivo de la empresa.",
    recomendacionIA:"PARTICIPAR", puntajeIA:94,
  },
  // ─────────────────────────────────────────────────────────────
  {
    id:"L10", proceso:"LP-MEDELLIN-IFI-004-2026",
    nombre:"Construcción Centro de Desarrollo Empresarial (CDE) — Parque Industrial Guayabal",
    objeto:"Construcción del Centro de Desarrollo Empresarial de Medellín: 3 naves industriales de 2.400 m² c/u, edificio administrativo de 4 pisos, vías internas, servicios públicos, zonas verdes y cerramiento. Estructura metálica y cubierta sandwich.",
    entidad:"Instituto para el Fomento Industrial de Medellín — IFIT", sector:"Desarrollo Económico",
    ciudad:"Medellín", departamento:"Antioquia",
    tipo:"Licitación Pública", modalidad:"Precio Global con Pago por Hitos",
    secopUrl:"secop2.gov.co/LP-MEDELLIN-IFI-004-2026",
    valorReferencial:18_650_000_000, presupuesto:18_650_000_000,
    plazoMeses:24,
    fechaPublicacion:"2026-06-03", fechaBuenaProForma:"2026-08-28", fechaOfertas:"2026-08-18", fechaAdjudicacion:"2026-09-12",
    kRequeridoSMMLV:13_073, kRequeridoCOP:18_650_000_000*0.70,
    status:"EN_ESTUDIO", compatibilidad:76, riesgoGlobal:"BAJO",
    requisitos:[
      { id:"R1", descripcion:"Experiencia en naves industriales o edificaciones industriales ≥$9.325M",  estado:"cumple",    critico:true  },
      { id:"R2", descripcion:"RUP vigente Subcategoría: Edificaciones y obras industriales",             estado:"cumple",    critico:true  },
      { id:"R3", descripcion:"Especialista en estructura metálica para naves industriales",              estado:"cumple",    critico:false },
      { id:"R4", descripcion:"Certificación NSR-10 para estructuras de gran luz (≥24m) sin columnas",   estado:"verificar", critico:false },
      { id:"R5", descripcion:"Experiencia en cubierta sandwich (PIR/PUR) instalada ≥8.000 m²",          estado:"verificar", critico:false },
    ],
    riesgos:[
      { id:"RS1", nivel:"BAJO", titulo:"Cubierta sandwich PIR — especialidad no propia",             mitigacion:"Subcontratar a ISOPANEL Colombia (proveedor e instalador certificado)." },
      { id:"RS2", nivel:"BAJO", titulo:"Plazo 24 meses con pago por hitos — cash flow presionado", mitigacion:"Estructurar carta de crédito bancaria para cubrir meses 1-4. Anticipo del 15%." },
    ],
    criterios:[
      { factor:"Menor valor oferta",                 puntos:65, tipo:"economico" },
      { factor:"Experiencia en edificaciones industriales",puntos:25,tipo:"tecnico" },
      { factor:"Metodología y plan de calidad",      puntos:10, tipo:"tecnico"  },
    ],
    garantiaSeriedad:       373_000_000,
    garantiaFielCumplimiento:1_865_000_000,
    resumenIA:"Buena oportunidad estratégica. El perfil de la empresa es compatible con esta licitación — la experiencia en Torre Empresarial Poblado (EDI-MED-002, Medellín, $12.150M) es directamente relevante. La única brecha es la cubierta sandwich, resuelta con subcontrato a ISOPANEL. Además, esta licitación está en Medellín donde la empresa tiene equipo activo y presencia. Se recomienda participar con oferta de $17.280M (descuento 7.4%).",
    recomendacionIA:"PARTICIPAR", puntajeIA:78,
  },
]

// ── Estadísticas del pipeline ─────────────────────────────────
export const pipelineStats = {
  total:              licitaciones.length,
  enEstudio:          licitaciones.filter(l => l.status === "EN_ESTUDIO").length,
  ofertaPreparada:    licitaciones.filter(l => l.status === "OFERTA_PREPARADA").length,
  presentadas:        licitaciones.filter(l => l.status === "PRESENTADA").length,
  adjudicadas:        licitaciones.filter(l => l.status === "ADJUDICADA").length,
  descartadas:        licitaciones.filter(l => l.status === "DESCARTADA").length,
  valorTotalPipeline: licitaciones.filter(l => !["DESCARTADA","DESIERTA"].includes(l.status)).reduce((s,l)=>s+l.valorReferencial,0),
  valorAdjudicado:    licitaciones.filter(l => l.status === "ADJUDICADA").reduce((s,l)=>s+l.valorReferencial,0),
  compatibilidadPromedio: Math.round(licitaciones.reduce((s,l)=>s+l.compatibilidad,0)/licitaciones.length),
  porRecomendar:      licitaciones.filter(l => l.recomendacionIA === "PARTICIPAR").length,
  porVerificar:       licitaciones.filter(l => l.recomendacionIA === "VERIFICAR").length,
  porDescartar:       licitaciones.filter(l => l.recomendacionIA === "DESCARTAR").length,
}
