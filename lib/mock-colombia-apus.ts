// 50 Análisis de Precios Unitarios — Constructora Andina S.A.S.
// Precios base Bogotá D.C. · Junio 2026 · Fuente: CAMACOL, DNP, INVIAS

export interface APUMaterial { matId: string; desc: string; unit: string; qty: number; unitPrice: number; total: number }
export interface APULabor    { category: string; hh: number; rate: number; total: number }
export interface APUEquip    { desc: string; unit: string; qty: number; unitPrice: number; total: number }

export interface APU {
  code: string
  name: string
  unit: string
  group: string
  materials:    APUMaterial[]
  labor:        APULabor[]
  equipment:    APUEquip[]
  materialsCost: number
  laborCost:     number
  equipmentCost: number
  totalCost:     number
  confidence:    number
  priceDate:     string
}

// Tasas de mano de obra (COP/HH con factor prestacional 1.85×)
const MO = { ayudante: 28_500, oficial: 38_000, especializado: 48_500, maestro: 58_000, operador: 65_000, soldador: 72_000 }

export const apus: APU[] = [
  // ── G1 DEMOLICIÓN Y PREPARACIÓN ──────────────────────────────
  {
    code:"APU-001", name:"Demolición de estructura en concreto",  unit:"m³", group:"Demolición", priceDate:"2026-06", confidence:0.92,
    materials:[
      { matId:"M183", desc:"Formaleta metálica (uso indirecto)", unit:"m²·día", qty:0, unitPrice:0, total:0 },
    ],
    labor:[
      { category:"Ayudante",          hh:4.5, rate:MO.ayudante,    total:4.5*MO.ayudante },
      { category:"Oficial demolición",hh:2.0, rate:MO.oficial,     total:2.0*MO.oficial  },
    ],
    equipment:[
      { desc:"Martillo neumático 40 kg",    unit:"h", qty:1.5, unitPrice:48_000, total:1.5*48_000 },
      { desc:"Compresor 185 PCM",           unit:"h", qty:1.5, unitPrice:85_000, total:1.5*85_000 },
      { desc:"Cargue y retiro de escombros",unit:"m³",qty:1.0, unitPrice:38_500, total:38_500 },
    ],
    materialsCost:0, laborCost:4.5*28_500+2.0*38_000, equipmentCost:1.5*48_000+1.5*85_000+38_500,
    get totalCost(){ return this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-002", name:"Desmonte y descapote terreno natural",  unit:"m²", group:"Demolición", priceDate:"2026-06", confidence:0.95,
    materials:[], labor:[
      { category:"Ayudante", hh:0.15, rate:MO.ayudante, total:0.15*MO.ayudante },
    ],
    equipment:[
      { desc:"Motoniveladora 140HP",   unit:"h", qty:0.008, unitPrice:285_000, total:0.008*285_000 },
      { desc:"Excavadora 200HP",       unit:"h", qty:0.005, unitPrice:320_000, total:0.005*320_000 },
      { desc:"Volqueta 8m³ (retiro)",  unit:"viaje",qty:0.05,unitPrice:85_000,total:0.05*85_000 },
    ],
    materialsCost:0, laborCost:0.15*MO.ayudante,
    equipmentCost:0.008*285_000+0.005*320_000+0.05*85_000,
    get totalCost(){ return this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-003", name:"Cerramiento provisional en malla sintetica h=2m", unit:"ml", group:"Demolición", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M180", desc:"Malla naranja h=2m",              unit:"ml",  qty:1.05, unitPrice:4_800,  total:1.05*4_800 },
      { matId:"M187", desc:"Madera rolliza D=12cm L=2.5m",    unit:"und", qty:0.40, unitPrice:12_500, total:0.40*12_500 },
      { matId:"M033", desc:"Alambre negro amarre",             unit:"kg",  qty:0.08, unitPrice:5_800,  total:0.08*5_800 },
    ],
    labor:[
      { category:"Ayudante", hh:0.30, rate:MO.ayudante, total:0.30*MO.ayudante },
      { category:"Oficial",  hh:0.15, rate:MO.oficial,  total:0.15*MO.oficial  },
    ],
    equipment:[],
    materialsCost:1.05*4_800+0.40*12_500+0.08*5_800,
    laborCost:0.30*MO.ayudante+0.15*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },

  // ── G2 EXCAVACIONES Y RELLENOS ────────────────────────────────
  {
    code:"APU-004", name:"Excavación manual en material común h≤2m",   unit:"m³", group:"Excavación", priceDate:"2026-06", confidence:0.96,
    materials:[], labor:[
      { category:"Ayudante", hh:2.8, rate:MO.ayudante, total:2.8*MO.ayudante },
      { category:"Oficial",  hh:0.5, rate:MO.oficial,  total:0.5*MO.oficial  },
    ],
    equipment:[
      { desc:"Herramienta menor (5% MO)", unit:"gl", qty:1, unitPrice:Math.round((2.8*MO.ayudante+0.5*MO.oficial)*0.05), total:Math.round((2.8*MO.ayudante+0.5*MO.oficial)*0.05) },
    ],
    materialsCost:0,
    laborCost:2.8*MO.ayudante+0.5*MO.oficial,
    get equipmentCost(){ return Math.round(this.laborCost*0.05) },
    get totalCost(){ return this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-005", name:"Excavación mecánica en material común",        unit:"m³", group:"Excavación", priceDate:"2026-06", confidence:0.97,
    materials:[], labor:[
      { category:"Ayudante",  hh:0.20, rate:MO.ayudante,  total:0.20*MO.ayudante },
      { category:"Operador",  hh:0.12, rate:MO.operador,  total:0.12*MO.operador },
    ],
    equipment:[
      { desc:"Retroexcavadora 130HP", unit:"h", qty:0.12, unitPrice:285_000, total:0.12*285_000 },
      { desc:"Volqueta 8m³",          unit:"h", qty:0.10, unitPrice:120_000, total:0.10*120_000 },
    ],
    materialsCost:0,
    laborCost:0.20*MO.ayudante+0.12*MO.operador,
    equipmentCost:0.12*285_000+0.10*120_000,
    get totalCost(){ return this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-006", name:"Excavación en roca con explosivos",            unit:"m³", group:"Excavación", priceDate:"2026-06", confidence:0.88,
    materials:[
      { matId:"M056", desc:"ANFO (amoniaco nitrato)",       unit:"kg",  qty:0.8,  unitPrice:8_500,  total:0.8*8_500 },
      { matId:"M183", desc:"Detonador eléctrico",           unit:"und", qty:0.6,  unitPrice:22_000, total:0.6*22_000 },
    ],
    labor:[
      { category:"Ayudante",        hh:1.2, rate:MO.ayudante,     total:1.2*MO.ayudante },
      { category:"Especializado",   hh:0.8, rate:MO.especializado, total:0.8*MO.especializado },
    ],
    equipment:[
      { desc:"Perforadora neumática", unit:"h", qty:0.5, unitPrice:125_000, total:0.5*125_000 },
      { desc:"Volqueta 8m³",          unit:"h", qty:0.2, unitPrice:120_000, total:0.2*120_000 },
    ],
    materialsCost:0.8*8_500+0.6*22_000, laborCost:1.2*MO.ayudante+0.8*MO.especializado,
    equipmentCost:0.5*125_000+0.2*120_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-007", name:"Relleno con material seleccionado compactado", unit:"m³", group:"Excavación", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M055", desc:"Material seleccionado préstamo", unit:"m³", qty:1.30, unitPrice:68_000, total:1.30*68_000 },
    ],
    labor:[
      { category:"Ayudante", hh:0.45, rate:MO.ayudante, total:0.45*MO.ayudante },
      { category:"Operador",  hh:0.10, rate:MO.operador, total:0.10*MO.operador },
    ],
    equipment:[
      { desc:"Compactador vibratorio 1 ton", unit:"h", qty:0.10, unitPrice:95_000, total:0.10*95_000 },
      { desc:"Agua para compactación",       unit:"m³",qty:0.05, unitPrice:4_800,  total:0.05*4_800  },
    ],
    materialsCost:1.30*68_000,
    laborCost:0.45*MO.ayudante+0.10*MO.operador,
    equipmentCost:0.10*95_000+0.05*4_800,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-008", name:"Relleno con recebo banco compactado",          unit:"m³", group:"Excavación", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M054", desc:"Recebo compactado", unit:"m³", qty:1.25, unitPrice:48_000, total:1.25*48_000 },
    ],
    labor:[
      { category:"Ayudante", hh:0.35, rate:MO.ayudante, total:0.35*MO.ayudante },
      { category:"Operador",  hh:0.08, rate:MO.operador, total:0.08*MO.operador },
    ],
    equipment:[
      { desc:"Compactador manual rana", unit:"h", qty:0.20, unitPrice:48_000, total:0.20*48_000 },
    ],
    materialsCost:1.25*48_000,
    laborCost:0.35*MO.ayudante+0.08*MO.operador,
    equipmentCost:0.20*48_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-009", name:"Entibado provisional de excavaciones",         unit:"m²", group:"Excavación", priceDate:"2026-06", confidence:0.90,
    materials:[
      { matId:"M184", desc:"Tabla pino 1\"×6\" L=3m",   unit:"m²",  qty:1.10, unitPrice:48_000, total:1.10*48_000 },
      { matId:"M187", desc:"Madera rolliza puntilla 3m", unit:"und", qty:0.8,  unitPrice:12_500, total:0.8*12_500  },
      { matId:"M033", desc:"Clavo 2.5\"",                unit:"kg",  qty:0.1,  unitPrice:5_800,  total:0.1*5_800   },
    ],
    labor:[
      { category:"Ayudante",  hh:0.8, rate:MO.ayudante, total:0.8*MO.ayudante },
      { category:"Carpintero",hh:0.6, rate:MO.oficial,  total:0.6*MO.oficial  },
    ],
    equipment:[],
    materialsCost:1.10*48_000+0.8*12_500+0.1*5_800,
    laborCost:0.8*MO.ayudante+0.6*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },

  // ── G3 CIMENTACIÓN ────────────────────────────────────────────
  {
    code:"APU-010", name:"Concreto ciclópeo 60% piedra para cimientos",  unit:"m³", group:"Cimentación", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M022", desc:"Concreto ciclópeo premezclado",  unit:"m³", qty:0.60, unitPrice:285_000, total:0.60*285_000 },
      { matId:"M051", desc:"Piedra rajón D=15-30cm",         unit:"m³", qty:0.40, unitPrice:68_000,  total:0.40*68_000  },
    ],
    labor:[
      { category:"Ayudante",   hh:1.8, rate:MO.ayudante, total:1.8*MO.ayudante },
      { category:"Oficial",    hh:0.8, rate:MO.oficial,  total:0.8*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.5, unitPrice:28_000, total:0.5*28_000 },
    ],
    materialsCost:0.60*285_000+0.40*68_000,
    laborCost:1.8*MO.ayudante+0.8*MO.oficial,
    equipmentCost:0.5*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-011", name:"Zapata aislada en concreto 21 MPa",            unit:"m³", group:"Cimentación", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",   unit:"m³", qty:1.05, unitPrice:425_000, total:1.05*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60",            unit:"kg",  qty:90,  unitPrice:3_050,   total:90*3_050     },
      { matId:"M032", desc:"Alambre negro No.16",           unit:"kg",  qty:2.5, unitPrice:4_200,   total:2.5*4_200    },
      { matId:"M188", desc:"Polietileno 6 mil (barrera)",   unit:"m²",  qty:2.0, unitPrice:2_400,   total:2.0*2_400    },
      { matId:"M189", desc:"Separadores plásticos 7cm",     unit:"und", qty:18,  unitPrice:850,     total:18*850       },
    ],
    labor:[
      { category:"Ayudante",     hh:2.5, rate:MO.ayudante, total:2.5*MO.ayudante },
      { category:"Oficial",      hh:1.5, rate:MO.oficial,  total:1.5*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.8, unitPrice:28_000, total:0.8*28_000 },
    ],
    materialsCost:1.05*425_000+90*3_050+2.5*4_200+2.0*2_400+18*850,
    laborCost:2.5*MO.ayudante+1.5*MO.oficial,
    equipmentCost:0.8*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-012", name:"Viga de cimentación 0.30×0.60 m concreto 21 MPa", unit:"ml", group:"Cimentación", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",  unit:"m³", qty:0.185, unitPrice:425_000, total:0.185*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60 (longitudinal)", unit:"kg", qty:28, unitPrice:3_050,total:28*3_050 },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (estribo)", unit:"kg",  qty:10,  unitPrice:3_050,   total:10*3_050  },
      { matId:"M032", desc:"Alambre negro No.16",          unit:"kg",  qty:0.8,  unitPrice:4_200,   total:0.8*4_200 },
      { matId:"M184", desc:"Formaleta madera lateral",     unit:"m²",  qty:1.2,  unitPrice:48_000,  total:1.2*48_000},
    ],
    labor:[
      { category:"Ayudante",     hh:1.2, rate:MO.ayudante, total:1.2*MO.ayudante },
      { category:"Oficial",      hh:0.9, rate:MO.oficial,  total:0.9*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.3, unitPrice:28_000, total:0.3*28_000 },
    ],
    materialsCost:0.185*425_000+28*3_050+10*3_050+0.8*4_200+1.2*48_000,
    laborCost:1.2*MO.ayudante+0.9*MO.oficial,
    equipmentCost:0.3*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-013", name:"Placa de contrapiso e=0.12m concreto 17.5MPa + malla ME5", unit:"m²", group:"Cimentación", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M016", desc:"Concreto 17.5 MPa premezclado", unit:"m³", qty:0.13, unitPrice:395_000, total:0.13*395_000 },
      { matId:"M030", desc:"Malla electrosoldada ME-5",      unit:"m²", qty:1.08, unitPrice:48_000,  total:1.08*48_000  },
      { matId:"M054", desc:"Recebo de nivelación",            unit:"m³", qty:0.05, unitPrice:48_000,  total:0.05*48_000  },
      { matId:"M188", desc:"Polietileno 6 mil barrera vapor", unit:"m²", qty:1.10, unitPrice:2_400,   total:1.10*2_400   },
    ],
    labor:[
      { category:"Ayudante", hh:0.50, rate:MO.ayudante, total:0.50*MO.ayudante },
      { category:"Oficial",  hh:0.30, rate:MO.oficial,  total:0.30*MO.oficial  },
    ],
    equipment:[
      { desc:"Regla vibrante mecánica",   unit:"h", qty:0.05, unitPrice:45_000, total:0.05*45_000 },
      { desc:"Vibrador de concreto",      unit:"h", qty:0.08, unitPrice:28_000, total:0.08*28_000 },
    ],
    materialsCost:0.13*395_000+1.08*48_000+0.05*48_000+1.10*2_400,
    laborCost:0.50*MO.ayudante+0.30*MO.oficial,
    equipmentCost:0.05*45_000+0.08*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-014", name:"Pilote hincado 35×35 cm concreto 28 MPa L=12m", unit:"und", group:"Cimentación", priceDate:"2026-06", confidence:0.88,
    materials:[
      { matId:"M019", desc:"Concreto 28 MPa premezclado",  unit:"m³", qty:1.50, unitPrice:485_000, total:1.50*485_000 },
      { matId:"M026", desc:"Varilla 5/8\" Gr60",           unit:"kg",  qty:180, unitPrice:3_050,   total:180*3_050    },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (espiral)", unit:"kg",  qty:48,  unitPrice:3_050,   total:48*3_050     },
    ],
    labor:[
      { category:"Ayudante",     hh:4.0, rate:MO.ayudante,  total:4.0*MO.ayudante  },
      { category:"Especializado",hh:2.0, rate:MO.especializado, total:2.0*MO.especializado },
    ],
    equipment:[
      { desc:"Equipo de hincado (piloteadora)", unit:"h", qty:2.0, unitPrice:485_000, total:2.0*485_000 },
      { desc:"Grúa asistente 30 ton",           unit:"h", qty:2.0, unitPrice:285_000, total:2.0*285_000 },
    ],
    materialsCost:1.50*485_000+180*3_050+48*3_050,
    laborCost:4.0*MO.ayudante+2.0*MO.especializado,
    equipmentCost:2.0*485_000+2.0*285_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-015", name:"Muro de contención en concreto 21MPa e=0.30m", unit:"m²", group:"Cimentación", priceDate:"2026-06", confidence:0.93,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",  unit:"m³", qty:0.32,  unitPrice:425_000, total:0.32*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60",           unit:"kg",  qty:22,   unitPrice:3_050,   total:22*3_050     },
      { matId:"M024", desc:"Varilla 3/8\" Gr60",           unit:"kg",  qty:8,    unitPrice:3_050,   total:8*3_050      },
      { matId:"M183", desc:"Formaleta metálica (alq)",     unit:"m²·día",qty:4.0,unitPrice:8_500,   total:4.0*8_500    },
      { matId:"M014", desc:"Impermeabilizante integral",   unit:"kg",  qty:0.85, unitPrice:8_900,   total:0.85*8_900   },
    ],
    labor:[
      { category:"Ayudante",  hh:1.2, rate:MO.ayudante, total:1.2*MO.ayudante },
      { category:"Oficial",   hh:0.8, rate:MO.oficial,  total:0.8*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto",   unit:"h", qty:0.4, unitPrice:28_000, total:0.4*28_000 },
    ],
    materialsCost:0.32*425_000+22*3_050+8*3_050+4.0*8_500+0.85*8_900,
    laborCost:1.2*MO.ayudante+0.8*MO.oficial,
    equipmentCost:0.4*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },

  // ── G4 ESTRUCTURA EN CONCRETO ─────────────────────────────────
  {
    code:"APU-016", name:"Columna rectangular 0.40×0.60 concreto 28 MPa", unit:"ml", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M019", desc:"Concreto 28 MPa premezclado",  unit:"m³", qty:0.24,  unitPrice:485_000, total:0.24*485_000 },
      { matId:"M027", desc:"Varilla 3/4\" Gr60 (longit.)", unit:"kg",  qty:38,   unitPrice:3_050,   total:38*3_050     },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (estribo)", unit:"kg",  qty:12,   unitPrice:3_050,   total:12*3_050     },
      { matId:"M032", desc:"Alambre negro No.16",          unit:"kg",  qty:1.2,  unitPrice:4_200,   total:1.2*4_200    },
      { matId:"M183", desc:"Formaleta metálica (alq 2días)",unit:"m²·día",qty:4.8,unitPrice:8_500,  total:4.8*8_500    },
      { matId:"M015", desc:"Desmoldante formaleta",        unit:"L",   qty:0.12, unitPrice:6_800,   total:0.12*6_800   },
    ],
    labor:[
      { category:"Ayudante",     hh:1.5, rate:MO.ayudante, total:1.5*MO.ayudante },
      { category:"Oficial",      hh:1.2, rate:MO.oficial,  total:1.2*MO.oficial  },
      { category:"Maestro",      hh:0.3, rate:MO.maestro,  total:0.3*MO.maestro  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.4, unitPrice:28_000, total:0.4*28_000 },
    ],
    materialsCost:0.24*485_000+38*3_050+12*3_050+1.2*4_200+4.8*8_500+0.12*6_800,
    laborCost:1.5*MO.ayudante+1.2*MO.oficial+0.3*MO.maestro,
    equipmentCost:0.4*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-017", name:"Columna circular D=0.60m concreto 35 MPa",     unit:"ml", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M020", desc:"Concreto 35 MPa premezclado",  unit:"m³", qty:0.285, unitPrice:548_000, total:0.285*548_000 },
      { matId:"M027", desc:"Varilla 3/4\" Gr60",           unit:"kg",  qty:45,   unitPrice:3_050,   total:45*3_050      },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (estribo)", unit:"kg",  qty:14,   unitPrice:3_050,   total:14*3_050      },
      { matId:"M032", desc:"Alambre negro No.16",          unit:"kg",  qty:1.5,  unitPrice:4_200,   total:1.5*4_200     },
      { matId:"M183", desc:"Formaleta tubo metálico(alq)", unit:"m²·día",qty:5.5,unitPrice:12_000,  total:5.5*12_000    },
    ],
    labor:[
      { category:"Ayudante",     hh:1.8, rate:MO.ayudante, total:1.8*MO.ayudante },
      { category:"Oficial",      hh:1.4, rate:MO.oficial,  total:1.4*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.5, unitPrice:28_000, total:0.5*28_000 },
      { desc:"Grúa torre (frac.)",   unit:"h", qty:0.1, unitPrice:680_000,total:0.1*680_000},
    ],
    materialsCost:0.285*548_000+45*3_050+14*3_050+1.5*4_200+5.5*12_000,
    laborCost:1.8*MO.ayudante+1.4*MO.oficial,
    equipmentCost:0.5*28_000+0.1*680_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-018", name:"Viga principal 0.30×0.60 concreto 28 MPa",     unit:"ml", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M019", desc:"Concreto 28 MPa premezclado",  unit:"m³", qty:0.185, unitPrice:485_000, total:0.185*485_000 },
      { matId:"M026", desc:"Varilla 5/8\" Gr60",           unit:"kg",  qty:32,   unitPrice:3_050,   total:32*3_050      },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (estribo)", unit:"kg",  qty:10,   unitPrice:3_050,   total:10*3_050      },
      { matId:"M032", desc:"Alambre negro No.16",          unit:"kg",  qty:0.9,  unitPrice:4_200,   total:0.9*4_200     },
      { matId:"M183", desc:"Formaleta metálica (alq)",     unit:"m²·día",qty:3.5,unitPrice:8_500,   total:3.5*8_500     },
      { matId:"M185", desc:"Parales telescópicos (alq)",   unit:"und·día",qty:2.5,unitPrice:3_200,  total:2.5*3_200     },
    ],
    labor:[
      { category:"Ayudante",  hh:1.0, rate:MO.ayudante, total:1.0*MO.ayudante },
      { category:"Oficial",   hh:0.9, rate:MO.oficial,  total:0.9*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.3, unitPrice:28_000, total:0.3*28_000 },
    ],
    materialsCost:0.185*485_000+32*3_050+10*3_050+0.9*4_200+3.5*8_500+2.5*3_200,
    laborCost:1.0*MO.ayudante+0.9*MO.oficial,
    equipmentCost:0.3*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-019", name:"Placa aligerada e=0.30m con bloques de arcilla", unit:"m²", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M018", desc:"Concreto 24 MPa premezclado",  unit:"m³", qty:0.095, unitPrice:455_000, total:0.095*455_000 },
      { matId:"M031", desc:"Malla electrosoldada ME-8",    unit:"m²",  qty:1.08, unitPrice:78_000,  total:1.08*78_000   },
      { matId:"M024", desc:"Varilla 3/8\" Gr60 (borde)",  unit:"kg",  qty:4.0,  unitPrice:3_050,   total:4.0*3_050     },
      { matId:"M063", desc:"Bloques de arcilla No.4 (alig)", unit:"und",qty:12.5,unitPrice:1_850,   total:12.5*1_850    },
      { matId:"M183", desc:"Formaleta metálica (alq)",    unit:"m²·día",qty:2.5, unitPrice:8_500,   total:2.5*8_500     },
      { matId:"M185", desc:"Parales telescópicos (alq)",  unit:"und·día",qty:1.8,unitPrice:3_200,   total:1.8*3_200     },
    ],
    labor:[
      { category:"Ayudante",  hh:0.8, rate:MO.ayudante, total:0.8*MO.ayudante },
      { category:"Oficial",   hh:0.5, rate:MO.oficial,  total:0.5*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.15, unitPrice:28_000, total:0.15*28_000 },
      { desc:"Grúa torre (fracción)",unit:"h", qty:0.05, unitPrice:680_000,total:0.05*680_000},
    ],
    materialsCost:0.095*455_000+1.08*78_000+4.0*3_050+12.5*1_850+2.5*8_500+1.8*3_200,
    laborCost:0.8*MO.ayudante+0.5*MO.oficial,
    equipmentCost:0.15*28_000+0.05*680_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-020", name:"Muro en concreto reforzado e=0.20m 21 MPa",    unit:"m²", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",  unit:"m³", qty:0.21,  unitPrice:425_000, total:0.21*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60",           unit:"kg",  qty:18,   unitPrice:3_050,   total:18*3_050     },
      { matId:"M024", desc:"Varilla 3/8\" Gr60",           unit:"kg",  qty:8,    unitPrice:3_050,   total:8*3_050      },
      { matId:"M183", desc:"Formaleta metálica (alq 2)",   unit:"m²·día",qty:4.0,unitPrice:8_500,   total:4.0*8_500    },
    ],
    labor:[
      { category:"Ayudante",  hh:1.0, rate:MO.ayudante, total:1.0*MO.ayudante },
      { category:"Oficial",   hh:0.7, rate:MO.oficial,  total:0.7*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.30, unitPrice:28_000, total:0.30*28_000 },
    ],
    materialsCost:0.21*425_000+18*3_050+8*3_050+4.0*8_500,
    laborCost:1.0*MO.ayudante+0.7*MO.oficial,
    equipmentCost:0.30*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-021", name:"Escalera en concreto 21 MPa (huellas y contra)", unit:"m²", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.92,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",  unit:"m³", qty:0.18, unitPrice:425_000, total:0.18*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60",           unit:"kg",  qty:25,  unitPrice:3_050,   total:25*3_050     },
      { matId:"M024", desc:"Varilla 3/8\" Gr60",           unit:"kg",  qty:8,   unitPrice:3_050,   total:8*3_050      },
      { matId:"M184", desc:"Formaleta madera base",        unit:"m²",  qty:1.5, unitPrice:48_000,  total:1.5*48_000   },
    ],
    labor:[
      { category:"Ayudante",  hh:1.5, rate:MO.ayudante, total:1.5*MO.ayudante },
      { category:"Oficial",   hh:1.2, rate:MO.oficial,  total:1.2*MO.oficial  },
    ],
    equipment:[
      { desc:"Vibrador de concreto", unit:"h", qty:0.4, unitPrice:28_000, total:0.4*28_000 },
    ],
    materialsCost:0.18*425_000+25*3_050+8*3_050+1.5*48_000,
    laborCost:1.5*MO.ayudante+1.2*MO.oficial,
    equipmentCost:0.4*28_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-022", name:"Columna metálica perfil W8×31 h=3m",           unit:"und", group:"Estructura Concreto", priceDate:"2026-06", confidence:0.93,
    materials:[
      { matId:"M036", desc:"Perfil W8×31 L=3.10m",         unit:"kg",  qty:148,  unitPrice:6_800, total:148*6_800  },
      { matId:"M041", desc:"Placa base 15mm 300×300",       unit:"kg",  qty:11,   unitPrice:6_200, total:11*6_200   },
      { matId:"M035", desc:"Pernos A325 3/4\"×3\"",         unit:"und", qty:4,    unitPrice:4_500, total:4*4_500    },
      { matId:"M144", desc:"Pintura anticorrosiva 2 manos", unit:"m²",  qty:1.2,  unitPrice:25_000,total:1.2*25_000 },
    ],
    labor:[
      { category:"Soldador",      hh:3.0, rate:MO.soldador,    total:3.0*MO.soldador    },
      { category:"Ayudante",      hh:2.0, rate:MO.ayudante,    total:2.0*MO.ayudante    },
      { category:"Especializado", hh:1.0, rate:MO.especializado,total:1.0*MO.especializado },
    ],
    equipment:[
      { desc:"Equipo de soldadura SMAW", unit:"h", qty:3.0, unitPrice:38_000, total:3.0*38_000 },
      { desc:"Grúa 12 ton (montaje)",   unit:"h", qty:0.5, unitPrice:285_000,total:0.5*285_000},
    ],
    materialsCost:148*6_800+11*6_200+4*4_500+1.2*25_000,
    laborCost:3.0*MO.soldador+2.0*MO.ayudante+1.0*MO.especializado,
    equipmentCost:3.0*38_000+0.5*285_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },

  // ── G5 ESTRUCTURA METÁLICA ────────────────────────────────────
  {
    code:"APU-023", name:"Cubierta metálica teja zinc cal.26 sobre correas", unit:"m²", group:"Cubierta Metálica", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M042", desc:"Lámina zinc cal.26 ondulada",   unit:"m²", qty:1.10, unitPrice:38_500, total:1.10*38_500 },
      { matId:"M040", desc:"Correa metálica cuadrada 60×60",unit:"ml", qty:0.5,  unitPrice:28_500*2.85, total:0.5*28_500*2.85 },
      { matId:"M033", desc:"Tornillo autopercante 12×2\"",   unit:"und",qty:6,    unitPrice:850,    total:6*850       },
    ],
    labor:[
      { category:"Ayudante",  hh:0.25, rate:MO.ayudante, total:0.25*MO.ayudante },
      { category:"Oficial",   hh:0.20, rate:MO.oficial,  total:0.20*MO.oficial  },
    ],
    equipment:[
      { desc:"Andamio (alquiler)", unit:"m²·día",qty:0.5, unitPrice:4_800, total:0.5*4_800 },
    ],
    materialsCost:1.10*38_500+0.5*28_500*2.85+6*850,
    laborCost:0.25*MO.ayudante+0.20*MO.oficial,
    equipmentCost:0.5*4_800,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-024", name:"Cercha metálica triangular L=12m (fabricación + mont)", unit:"und", group:"Cubierta Metálica", priceDate:"2026-06", confidence:0.90,
    materials:[
      { matId:"M039", desc:"Perfil L75×75×6 (cordón superior)", unit:"kg", qty:280, unitPrice:6_500, total:280*6_500 },
      { matId:"M040", desc:"Perfil tubular cuadrado 60×60×3",  unit:"kg", qty:180, unitPrice:7_400, total:180*7_400 },
      { matId:"M041", desc:"Platinas de conexión 1/4\"",        unit:"kg", qty:45,  unitPrice:6_200, total:45*6_200  },
      { matId:"M144", desc:"Pintura anticorrosiva primer",      unit:"m²", qty:28,  unitPrice:25_000,total:28*25_000 },
      { matId:"M143", desc:"Esmalte sintético acabado",         unit:"m²", qty:28,  unitPrice:18_000,total:28*18_000 },
    ],
    labor:[
      { category:"Soldador",      hh:24, rate:MO.soldador,     total:24*MO.soldador     },
      { category:"Ayudante",      hh:16, rate:MO.ayudante,     total:16*MO.ayudante     },
      { category:"Especializado", hh:8,  rate:MO.especializado,total:8*MO.especializado  },
    ],
    equipment:[
      { desc:"Equipo soldadura",  unit:"h", qty:24,  unitPrice:38_000,  total:24*38_000   },
      { desc:"Grúa 20 ton (mont)", unit:"h",qty:2.0, unitPrice:385_000, total:2.0*385_000 },
    ],
    materialsCost:280*6_500+180*7_400+45*6_200+28*25_000+28*18_000,
    laborCost:24*MO.soldador+16*MO.ayudante+8*MO.especializado,
    equipmentCost:24*38_000+2.0*385_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-025", name:"Fachada en lámina ACM con estructura secundaria", unit:"m²", group:"Cubierta Metálica", priceDate:"2026-06", confidence:0.91,
    materials:[
      { matId:"M043", desc:"Lámina ACM 4mm Alucobond",         unit:"m²", qty:1.08, unitPrice:145_000, total:1.08*145_000 },
      { matId:"M040", desc:"Perfil tubular 60×60×3 (subestructura)", unit:"kg",qty:8.5,unitPrice:7_400,total:8.5*7_400 },
      { matId:"M079", desc:"Silicona estructural Dow 995",     unit:"und", qty:0.15, unitPrice:68_000,  total:0.15*68_000  },
      { matId:"M034", desc:"Perno expansivo 3/8\" (fijación)", unit:"und", qty:4,    unitPrice:2_800,   total:4*2_800       },
    ],
    labor:[
      { category:"Especializado",hh:1.8, rate:MO.especializado, total:1.8*MO.especializado },
      { category:"Ayudante",     hh:1.0, rate:MO.ayudante,      total:1.0*MO.ayudante      },
    ],
    equipment:[
      { desc:"Andamio alquiler", unit:"m²·día",qty:1.5, unitPrice:4_800, total:1.5*4_800 },
    ],
    materialsCost:1.08*145_000+8.5*7_400+0.15*68_000+4*2_800,
    laborCost:1.8*MO.especializado+1.0*MO.ayudante,
    equipmentCost:1.5*4_800,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },

  // ── G6 MAMPOSTERÍA Y PAÑETES ──────────────────────────────────
  {
    code:"APU-026", name:"Muro en bloque arcilla No.4 mortero 1:4 e=0.12m", unit:"m²", group:"Mampostería", priceDate:"2026-06", confidence:0.97,
    materials:[
      { matId:"M063", desc:"Bloque arcilla No.4 (12×20×32)",  unit:"und", qty:12.5, unitPrice:1_850, total:12.5*1_850 },
      { matId:"M001", desc:"Cemento Portland Tipo I (mortero)",unit:"kg",  qty:5.2,  unitPrice:650,   total:5.2*650    },
      { matId:"M046", desc:"Arena de río (mortero 1:4)",       unit:"m³",  qty:0.018,unitPrice:72_000,total:0.018*72_000 },
      { matId:"M191", desc:"Agua potable",                     unit:"m³",  qty:0.005,unitPrice:4_800, total:0.005*4_800  },
    ],
    labor:[
      { category:"Ayudante",    hh:0.40, rate:MO.ayudante, total:0.40*MO.ayudante },
      { category:"Oficial",     hh:0.85, rate:MO.oficial,  total:0.85*MO.oficial  },
    ],
    equipment:[
      { desc:"Mezcladora 1 saco (frac.)", unit:"h", qty:0.05, unitPrice:35_000, total:0.05*35_000 },
    ],
    materialsCost:12.5*1_850+5.2*650+0.018*72_000+0.005*4_800,
    laborCost:0.40*MO.ayudante+0.85*MO.oficial,
    equipmentCost:0.05*35_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-027", name:"Muro bloque AAC 20×20×60 cm mortero especial",   unit:"m²", group:"Mampostería", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M067", desc:"Bloque AAC 20×20×60",              unit:"und", qty:8.33, unitPrice:5_800, total:8.33*5_800 },
      { matId:"M005", desc:"Mortero seco premezclado (AAC)",   unit:"kg",  qty:6.0,  unitPrice:740,   total:6.0*740    },
    ],
    labor:[
      { category:"Ayudante",    hh:0.30, rate:MO.ayudante, total:0.30*MO.ayudante },
      { category:"Oficial",     hh:0.55, rate:MO.oficial,  total:0.55*MO.oficial  },
    ],
    equipment:[],
    materialsCost:8.33*5_800+6.0*740,
    laborCost:0.30*MO.ayudante+0.55*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-028", name:"Pañete liso muros exteriores mortero 1:4 e=1.5cm", unit:"m²", group:"Mampostería", priceDate:"2026-06", confidence:0.97,
    materials:[
      { matId:"M001", desc:"Cemento Portland Tipo I",    unit:"kg",  qty:6.5,  unitPrice:650,    total:6.5*650     },
      { matId:"M047", desc:"Arena de peña triturada",    unit:"m³",  qty:0.022,unitPrice:65_000, total:0.022*65_000},
      { matId:"M004", desc:"Cal hidratada",              unit:"kg",  qty:1.8,  unitPrice:380,    total:1.8*380     },
      { matId:"M191", desc:"Agua potable",               unit:"m³",  qty:0.006,unitPrice:4_800,  total:0.006*4_800 },
    ],
    labor:[
      { category:"Ayudante",    hh:0.35, rate:MO.ayudante, total:0.35*MO.ayudante },
      { category:"Oficial",     hh:0.60, rate:MO.oficial,  total:0.60*MO.oficial  },
    ],
    equipment:[
      { desc:"Mezcladora 1 saco", unit:"h", qty:0.04, unitPrice:35_000, total:0.04*35_000 },
      { desc:"Andamio (alq)",    unit:"m²·día",qty:0.3,unitPrice:4_800, total:0.3*4_800   },
    ],
    materialsCost:6.5*650+0.022*65_000+1.8*380+0.006*4_800,
    laborCost:0.35*MO.ayudante+0.60*MO.oficial,
    equipmentCost:0.04*35_000+0.3*4_800,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-029", name:"Pañete impermeabilizado baños 1:3 e=1.5cm",     unit:"m²", group:"Mampostería", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M001", desc:"Cemento Portland Tipo I",    unit:"kg",  qty:8.0,  unitPrice:650,   total:8.0*650     },
      { matId:"M046", desc:"Arena de río lavada",        unit:"m³",  qty:0.018,unitPrice:72_000,total:0.018*72_000},
      { matId:"M014", desc:"Impermeabilizante Sika-1",   unit:"kg",  qty:0.25, unitPrice:8_900, total:0.25*8_900  },
    ],
    labor:[
      { category:"Ayudante",  hh:0.40, rate:MO.ayudante, total:0.40*MO.ayudante },
      { category:"Oficial",   hh:0.70, rate:MO.oficial,  total:0.70*MO.oficial  },
    ],
    equipment:[
      { desc:"Mezcladora 1 saco", unit:"h", qty:0.04, unitPrice:35_000, total:0.04*35_000 },
    ],
    materialsCost:8.0*650+0.018*72_000+0.25*8_900,
    laborCost:0.40*MO.ayudante+0.70*MO.oficial,
    equipmentCost:0.04*35_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-030", name:"Estuco plástico interior dos manos + vinílica",  unit:"m²", group:"Mampostería", priceDate:"2026-06", confidence:0.97,
    materials:[
      { matId:"M145", desc:"Estuco plástico acrílico (2m)",  unit:"galón",qty:0.08, unitPrice:38_000, total:0.08*38_000 },
      { matId:"M141", desc:"Vinilo tipo 1 extra (2 manos)",  unit:"galón",qty:0.12, unitPrice:58_000, total:0.12*58_000 },
      { matId:"M148", desc:"Sellador de poros (1 mano)",     unit:"galón",qty:0.05, unitPrice:32_000, total:0.05*32_000 },
      { matId:"M193", desc:"Lija grano 120",                 unit:"und",  qty:0.10, unitPrice:3_500,  total:0.10*3_500  },
    ],
    labor:[
      { category:"Ayudante",    hh:0.15, rate:MO.ayudante,     total:0.15*MO.ayudante     },
      { category:"Especializado",hh:0.35,rate:MO.especializado, total:0.35*MO.especializado },
    ],
    equipment:[],
    materialsCost:0.08*38_000+0.12*58_000+0.05*32_000+0.10*3_500,
    laborCost:0.15*MO.ayudante+0.35*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },

  // ── G7 PISOS Y ACABADOS ───────────────────────────────────────
  {
    code:"APU-031", name:"Piso porcelanato 60×60 cm instalado",            unit:"m²", group:"Pisos Acabados", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M125", desc:"Porcelanato 60×60 mate rect.",   unit:"m²", qty:1.06, unitPrice:85_000, total:1.06*85_000 },
      { matId:"M131", desc:"Pegante flexible Weber.col flex",unit:"kg",  qty:5.5,  unitPrice:1_140,  total:5.5*1_140   },
      { matId:"M132", desc:"Boquilla Sika (junta 3mm)",      unit:"kg",  qty:0.4,  unitPrice:9_400,  total:0.4*9_400   },
      { matId:"M006", desc:"Mortero nivelación base 2cm",    unit:"kg",  qty:28,   unitPrice:740,    total:28*740      },
    ],
    labor:[
      { category:"Ayudante",     hh:0.40, rate:MO.ayudante,     total:0.40*MO.ayudante     },
      { category:"Especializado",hh:0.80, rate:MO.especializado, total:0.80*MO.especializado },
    ],
    equipment:[],
    materialsCost:1.06*85_000+5.5*1_140+0.4*9_400+28*740,
    laborCost:0.40*MO.ayudante+0.80*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-032", name:"Enchape pared cerámica 30×60 cm baños",          unit:"m²", group:"Pisos Acabados", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M128", desc:"Cerámica pared 30×60",           unit:"m²", qty:1.06, unitPrice:58_000, total:1.06*58_000 },
      { matId:"M131", desc:"Pegante flexible Weber",         unit:"kg",  qty:5.0,  unitPrice:1_140,  total:5.0*1_140   },
      { matId:"M132", desc:"Boquilla Sika",                  unit:"kg",  qty:0.35, unitPrice:9_400,  total:0.35*9_400  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.35, rate:MO.ayudante,     total:0.35*MO.ayudante     },
      { category:"Especializado",hh:0.75, rate:MO.especializado, total:0.75*MO.especializado },
    ],
    equipment:[],
    materialsCost:1.06*58_000+5.0*1_140+0.35*9_400,
    laborCost:0.35*MO.ayudante+0.75*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-033", name:"Cielo raso en drywall 1/2\" suspendido h=2.80m", unit:"m²", group:"Pisos Acabados", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M149", desc:"Lámina drywall 1/2\" estándar",  unit:"und", qty:0.42, unitPrice:38_500, total:0.42*38_500 },
      { matId:"M155", desc:"Cielo raso fibra mineral 60×60", unit:"m²",  qty:1.05, unitPrice:48_000, total:1.05*48_000 },
      { matId:"M156", desc:"Perfil T principal Armstrong",   unit:"ml",  qty:0.85, unitPrice:8_500,  total:0.85*8_500  },
      { matId:"M154", desc:"Pasta de juntas drywall",        unit:"kg",  qty:0.4,  unitPrice:2_678,  total:0.4*2_678   },
    ],
    labor:[
      { category:"Ayudante",     hh:0.50, rate:MO.ayudante,     total:0.50*MO.ayudante     },
      { category:"Especializado",hh:0.65, rate:MO.especializado, total:0.65*MO.especializado },
    ],
    equipment:[],
    materialsCost:0.42*38_500+1.05*48_000+0.85*8_500+0.4*2_678,
    laborCost:0.50*MO.ayudante+0.65*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-034", name:"Piso vinílico LVT 4mm click-lock instalado",    unit:"m²", group:"Pisos Acabados", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M129", desc:"Piso vinílico LVT 4mm",          unit:"m²", qty:1.08, unitPrice:72_000, total:1.08*72_000 },
      { matId:"M188", desc:"Polietileno bajo capa (barrera)", unit:"m²", qty:1.10, unitPrice:2_400,  total:1.10*2_400  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.20, rate:MO.ayudante,     total:0.20*MO.ayudante     },
      { category:"Especializado",hh:0.45, rate:MO.especializado, total:0.45*MO.especializado },
    ],
    equipment:[],
    materialsCost:1.08*72_000+1.10*2_400,
    laborCost:0.20*MO.ayudante+0.45*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-035", name:"Pintura vinílica tipo 1 (2m) + sellador (1m) interior", unit:"m²", group:"Pisos Acabados", priceDate:"2026-06", confidence:0.97,
    materials:[
      { matId:"M141", desc:"Vinilo tipo 1 extra (2 manos)", unit:"galón",qty:0.12, unitPrice:58_000, total:0.12*58_000 },
      { matId:"M148", desc:"Sellador de poros (1 mano)",   unit:"galón",qty:0.05, unitPrice:32_000, total:0.05*32_000 },
    ],
    labor:[
      { category:"Ayudante",     hh:0.10, rate:MO.ayudante,     total:0.10*MO.ayudante     },
      { category:"Especializado",hh:0.25, rate:MO.especializado, total:0.25*MO.especializado },
    ],
    equipment:[],
    materialsCost:0.12*58_000+0.05*32_000,
    laborCost:0.10*MO.ayudante+0.25*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },

  // ── G8 CUBIERTA ───────────────────────────────────────────────
  {
    code:"APU-036", name:"Cubierta membrana asfáltica bicapa 4mm",        unit:"m²", group:"Cubierta", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M075", desc:"Membrana bituminosa 4mm APP",   unit:"m²", qty:1.15, unitPrice:42_000, total:1.15*42_000 },
      { matId:"M076", desc:"Impermeabilizante acrílico (cap. terminación)",unit:"L",qty:0.25,unitPrice:38_000,total:0.25*38_000 },
      { matId:"M061", desc:"Emulsión asfáltica (imprimante)",unit:"L",  qty:0.20, unitPrice:2_400,  total:0.20*2_400  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.45, rate:MO.ayudante,     total:0.45*MO.ayudante     },
      { category:"Especializado",hh:0.50, rate:MO.especializado, total:0.50*MO.especializado },
    ],
    equipment:[
      { desc:"Soplete gas propano (frac.)", unit:"h", qty:0.10, unitPrice:8_500, total:0.10*8_500 },
    ],
    materialsCost:1.15*42_000+0.25*38_000+0.20*2_400,
    laborCost:0.45*MO.ayudante+0.50*MO.especializado,
    equipmentCost:0.10*8_500,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-037", name:"Cubierta teja fibrocemento ondulada sobre correas", unit:"m²", group:"Cubierta", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M074", desc:"Teja fibrocemento ondulada",    unit:"m²", qty:1.10, unitPrice:28_500, total:1.10*28_500 },
      { matId:"M040", desc:"Correa tubular 60×60×3 L=6m",  unit:"ml", qty:0.40, unitPrice:28_500*2.85,total:0.40*28_500*2.85 },
      { matId:"M033", desc:"Tornillo cubierta galv. (und)", unit:"und",qty:5,    unitPrice:850,    total:5*850        },
    ],
    labor:[
      { category:"Ayudante",  hh:0.30, rate:MO.ayudante, total:0.30*MO.ayudante },
      { category:"Oficial",   hh:0.20, rate:MO.oficial,  total:0.20*MO.oficial  },
    ],
    equipment:[],
    materialsCost:1.10*28_500+0.40*28_500*2.85+5*850,
    laborCost:0.30*MO.ayudante+0.20*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-038", name:"Cubierta verde extensiva sustrato 10cm",         unit:"m²", group:"Cubierta", priceDate:"2026-06", confidence:0.88,
    materials:[
      { matId:"M075", desc:"Membrana impermeable base EPDM",unit:"m²", qty:1.10, unitPrice:52_000, total:1.10*52_000 },
      { matId:"M169", desc:"Geocompuesto drenante 25mm",    unit:"m²", qty:1.05, unitPrice:38_500, total:1.05*38_500 },
      { matId:"M166", desc:"Geotextil NT-3000 filtro",      unit:"m²", qty:1.05, unitPrice:5_800,  total:1.05*5_800  },
      { matId:"M056", desc:"Sustrato ligero (perlita+turba)",unit:"m³",qty:0.12, unitPrice:185_000,total:0.12*185_000},
    ],
    labor:[
      { category:"Ayudante",     hh:0.80, rate:MO.ayudante,     total:0.80*MO.ayudante     },
      { category:"Especializado",hh:0.50, rate:MO.especializado, total:0.50*MO.especializado },
    ],
    equipment:[],
    materialsCost:1.10*52_000+1.05*38_500+1.05*5_800+0.12*185_000,
    laborCost:0.80*MO.ayudante+0.50*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },

  // ── G9 INSTALACIONES HIDROSANITARIAS ─────────────────────────
  {
    code:"APU-039", name:"Red tubería PVC presión 2\" RDE-21 instalada",   unit:"ml", group:"Hidrosanitaria", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M088", desc:"Tubería PVC 2\" RDE-21 L=6m",   unit:"ml", qty:1.05, unitPrice:22_500, total:1.05*22_500 },
      { matId:"M096", desc:"Unión PVC 2\" + soldadura",     unit:"und", qty:0.17, unitPrice:6_800,  total:0.17*6_800  },
    ],
    labor:[
      { category:"Ayudante",  hh:0.15, rate:MO.ayudante, total:0.15*MO.ayudante },
      { category:"Oficial",   hh:0.25, rate:MO.oficial,  total:0.25*MO.oficial  },
    ],
    equipment:[],
    materialsCost:1.05*22_500+0.17*6_800,
    laborCost:0.15*MO.ayudante+0.25*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-040", name:"Red tubería PVC sanitaria 4\" instalada",        unit:"ml", group:"Hidrosanitaria", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M093", desc:"Tubería PVC sanitaria 4\" L=3m", unit:"ml", qty:1.05, unitPrice:22_000, total:1.05*22_000 },
      { matId:"M095", desc:"Codo 90° PVC 4\"",               unit:"und", qty:0.10, unitPrice:12_500, total:0.10*12_500 },
    ],
    labor:[
      { category:"Ayudante",  hh:0.20, rate:MO.ayudante, total:0.20*MO.ayudante },
      { category:"Oficial",   hh:0.30, rate:MO.oficial,  total:0.30*MO.oficial  },
    ],
    equipment:[],
    materialsCost:1.05*22_000+0.10*12_500,
    laborCost:0.20*MO.ayudante+0.30*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-041", name:"Punto hidráulico PVC 1/2\" (agua fría/caliente)", unit:"und", group:"Hidrosanitaria", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M085", desc:"Tubería PVC 1/2\" RDE-21",     unit:"ml", qty:3.5, unitPrice:4_800,  total:3.5*4_800  },
      { matId:"M095", desc:"Codo PVC 1/2\" (und)",         unit:"und",qty:2,   unitPrice:2_500,  total:2*2_500    },
      { matId:"M097", desc:"Tee PVC 1/2\"",                unit:"und",qty:1,   unitPrice:3_200,  total:3_200      },
      { matId:"M080", desc:"Foam sellado (frac.)",          unit:"und",qty:0.1, unitPrice:28_000, total:0.1*28_000 },
    ],
    labor:[
      { category:"Ayudante",  hh:0.5, rate:MO.ayudante, total:0.5*MO.ayudante },
      { category:"Oficial",   hh:0.8, rate:MO.oficial,  total:0.8*MO.oficial  },
    ],
    equipment:[],
    materialsCost:3.5*4_800+2*2_500+3_200+0.1*28_000,
    laborCost:0.5*MO.ayudante+0.8*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-042", name:"Caja de inspección 60×60 cm profundidad 1.0m",  unit:"und", group:"Hidrosanitaria", priceDate:"2026-06", confidence:0.94,
    materials:[
      { matId:"M017", desc:"Concreto 21 MPa premezclado",  unit:"m³", qty:0.12, unitPrice:425_000, total:0.12*425_000 },
      { matId:"M025", desc:"Varilla 1/2\" Gr60",           unit:"kg",  qty:8,   unitPrice:3_050,   total:8*3_050      },
      { matId:"M063", desc:"Ladrillo tolete (paredes)",     unit:"und", qty:40,  unitPrice:1_850,   total:40*1_850     },
      { matId:"M001", desc:"Mortero pañete 1:3",           unit:"kg",  qty:18,  unitPrice:650,     total:18*650       },
    ],
    labor:[
      { category:"Ayudante",  hh:2.5, rate:MO.ayudante, total:2.5*MO.ayudante },
      { category:"Oficial",   hh:2.0, rate:MO.oficial,  total:2.0*MO.oficial  },
    ],
    equipment:[],
    materialsCost:0.12*425_000+8*3_050+40*1_850+18*650,
    laborCost:2.5*MO.ayudante+2.0*MO.oficial,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-043", name:"Tubería HDPE 200mm PE100 PN10 instalada (zanja)",unit:"ml", group:"Hidrosanitaria", priceDate:"2026-06", confidence:0.92,
    materials:[
      { matId:"M102", desc:"Tubería HDPE 200mm PN10",       unit:"ml", qty:1.02, unitPrice:198_000, total:1.02*198_000 },
      { matId:"M104", desc:"Codo HDPE 90° electrofusión",   unit:"und", qty:0.05, unitPrice:185_000, total:0.05*185_000 },
      { matId:"M054", desc:"Cama de recebo (protección)",   unit:"m³",  qty:0.12, unitPrice:48_000,  total:0.12*48_000  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.50, rate:MO.ayudante,     total:0.50*MO.ayudante     },
      { category:"Especializado",hh:0.35, rate:MO.especializado, total:0.35*MO.especializado },
      { category:"Operador",     hh:0.15, rate:MO.operador,      total:0.15*MO.operador      },
    ],
    equipment:[
      { desc:"Equipo termofusión HDPE", unit:"h", qty:0.20, unitPrice:125_000, total:0.20*125_000 },
      { desc:"Retroexcavadora (zanja)", unit:"h", qty:0.15, unitPrice:285_000, total:0.15*285_000 },
    ],
    materialsCost:1.02*198_000+0.05*185_000+0.12*48_000,
    laborCost:0.50*MO.ayudante+0.35*MO.especializado+0.15*MO.operador,
    equipmentCost:0.20*125_000+0.15*285_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },

  // ── G10 INSTALACIONES ELÉCTRICAS ──────────────────────────────
  {
    code:"APU-044", name:"Tubería conduit EMT 3/4\" embutida con cable THW 12AWG",unit:"ml",group:"Eléctrico",priceDate:"2026-06",confidence:0.96,
    materials:[
      { matId:"M113", desc:"Conduit EMT 3/4\" L=3.05m",    unit:"ml", qty:1.05, unitPrice:8_500,  total:1.05*8_500  },
      { matId:"M107", desc:"Cable THW-LS 12AWG (2 hilos)", unit:"ml", qty:2.10, unitPrice:2_800,  total:2.10*2_800  },
      { matId:"M115", desc:"Conduit PVC 3/4\" (bajadas)",  unit:"ml", qty:0.30, unitPrice:4_200,  total:0.30*4_200  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.18, rate:MO.ayudante,     total:0.18*MO.ayudante     },
      { category:"Especializado",hh:0.25, rate:MO.especializado, total:0.25*MO.especializado },
    ],
    equipment:[],
    materialsCost:1.05*8_500+2.10*2_800+0.30*4_200,
    laborCost:0.18*MO.ayudante+0.25*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-045", name:"Tablero distribución 24 circuitos 220V instalado", unit:"und", group:"Eléctrico", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M118", desc:"Tablero 24 circuitos 220V",    unit:"und", qty:1,   unitPrice:485_000, total:485_000   },
      { matId:"M119", desc:"Breaker monopolar 20A",         unit:"und", qty:16,  unitPrice:38_000,  total:16*38_000 },
      { matId:"M121", desc:"Breaker tripolar 3×60A",        unit:"und", qty:1,   unitPrice:148_000, total:148_000   },
      { matId:"M110", desc:"Cable THW-LS 6AWG (acometida)",unit:"ml",  qty:8.0, unitPrice:12_500,  total:8.0*12_500},
    ],
    labor:[
      { category:"Ayudante",     hh:2.5, rate:MO.ayudante,     total:2.5*MO.ayudante     },
      { category:"Especializado",hh:4.0, rate:MO.especializado, total:4.0*MO.especializado },
    ],
    equipment:[],
    materialsCost:485_000+16*38_000+148_000+8.0*12_500,
    laborCost:2.5*MO.ayudante+4.0*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-046", name:"Tomacorriente doble 20A polarizado instalado",   unit:"und", group:"Eléctrico", priceDate:"2026-06", confidence:0.97,
    materials:[
      { matId:"M122", desc:"Tomacorriente 20A 3 polos",    unit:"und", qty:1, unitPrice:28_500, total:28_500 },
      { matId:"M107", desc:"Cable THW-LS 12AWG (ramal)",   unit:"ml", qty:3.0,unitPrice:2_800,  total:3.0*2_800 },
    ],
    labor:[
      { category:"Ayudante",     hh:0.15, rate:MO.ayudante,     total:0.15*MO.ayudante     },
      { category:"Especializado",hh:0.30, rate:MO.especializado, total:0.30*MO.especializado },
    ],
    equipment:[],
    materialsCost:28_500+3.0*2_800,
    laborCost:0.15*MO.ayudante+0.30*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-047", name:"Luminaria panel LED 2×2 40W instalada",          unit:"und", group:"Eléctrico", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M123", desc:"Panel LED 2×2 40W 3000K",     unit:"und", qty:1, unitPrice:145_000, total:145_000 },
      { matId:"M107", desc:"Cable THW 12AWG ramal",        unit:"ml", qty:4, unitPrice:2_800,   total:4*2_800  },
    ],
    labor:[
      { category:"Ayudante",     hh:0.20, rate:MO.ayudante,     total:0.20*MO.ayudante     },
      { category:"Especializado",hh:0.35, rate:MO.especializado, total:0.35*MO.especializado },
    ],
    equipment:[],
    materialsCost:145_000+4*2_800,
    laborCost:0.20*MO.ayudante+0.35*MO.especializado,
    equipmentCost:0,
    get totalCost(){ return this.materialsCost+this.laborCost }
  },
  {
    code:"APU-048", name:"Pararrayos Franklin Ø16mm + bajante cobre 35mm²",unit:"und", group:"Eléctrico", priceDate:"2026-06", confidence:0.90,
    materials:[
      { matId:"M111", desc:"Cable desnudo Cu 35mm² L=25m", unit:"ml", qty:28,  unitPrice:38_500, total:28*38_500  },
      { matId:"M034", desc:"Perno anclaje (soporte mastil)",unit:"und",qty:8,   unitPrice:2_800,  total:8*2_800    },
      { matId:"M183", desc:"Mastil galv. 1.5m Ø2\"",      unit:"und", qty:1,   unitPrice:85_000, total:85_000     },
    ],
    labor:[
      { category:"Ayudante",     hh:4.0, rate:MO.ayudante,     total:4.0*MO.ayudante     },
      { category:"Especializado",hh:6.0, rate:MO.especializado, total:6.0*MO.especializado },
    ],
    equipment:[
      { desc:"Equipo soldadura exotérmica",unit:"und",qty:4, unitPrice:28_000, total:4*28_000 },
      { desc:"Andamio (alquiler)",         unit:"m²·día",qty:12,unitPrice:4_800,total:12*4_800 },
    ],
    materialsCost:28*38_500+8*2_800+85_000,
    laborCost:4.0*MO.ayudante+6.0*MO.especializado,
    equipmentCost:4*28_000+12*4_800,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },

  // ── G11 VÍAS Y PAVIMENTOS ─────────────────────────────────────
  {
    code:"APU-049", name:"Estructura de pavimento: subbase+base+MDC-19 e=35cm", unit:"m²", group:"Vías Pavimentos", priceDate:"2026-06", confidence:0.95,
    materials:[
      { matId:"M053", desc:"Sub-base granular SBG e=15cm",  unit:"m³", qty:0.165,unitPrice:82_000,  total:0.165*82_000  },
      { matId:"M052", desc:"Base granular BG-1 e=15cm",     unit:"m³", qty:0.165,unitPrice:95_000,  total:0.165*95_000  },
      { matId:"M058", desc:"MDC-19 capa e=5cm",             unit:"ton",qty:0.120,unitPrice:285_000, total:0.120*285_000 },
      { matId:"M060", desc:"Emulsión riego de liga CRL-1",  unit:"L",  qty:0.40, unitPrice:2_800,   total:0.40*2_800    },
      { matId:"M061", desc:"Emulsión imprimación CRR-1",    unit:"L",  qty:1.20, unitPrice:2_400,   total:1.20*2_400    },
    ],
    labor:[
      { category:"Ayudante",  hh:0.25, rate:MO.ayudante,  total:0.25*MO.ayudante  },
      { category:"Oficial",   hh:0.10, rate:MO.oficial,   total:0.10*MO.oficial   },
      { category:"Operador",  hh:0.12, rate:MO.operador,  total:0.12*MO.operador  },
    ],
    equipment:[
      { desc:"Motoniveladora 140HP",   unit:"h", qty:0.03,  unitPrice:285_000, total:0.03*285_000 },
      { desc:"Compactador doble tanda",unit:"h", qty:0.04,  unitPrice:245_000, total:0.04*245_000 },
      { desc:"Finisher asfáltica",     unit:"h", qty:0.018, unitPrice:580_000, total:0.018*580_000},
      { desc:"Rodillo neumático",      unit:"h", qty:0.018, unitPrice:285_000, total:0.018*285_000},
    ],
    materialsCost:0.165*82_000+0.165*95_000+0.120*285_000+0.40*2_800+1.20*2_400,
    laborCost:0.25*MO.ayudante+0.10*MO.oficial+0.12*MO.operador,
    equipmentCost:0.03*285_000+0.04*245_000+0.018*580_000+0.018*285_000,
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
  {
    code:"APU-050", name:"Sardinel prefabricado tipo A 50×30×12cm instalado", unit:"ml", group:"Vías Pavimentos", priceDate:"2026-06", confidence:0.96,
    materials:[
      { matId:"M071", desc:"Sardinel prefabricado tipo A",  unit:"ml", qty:1.03, unitPrice:35_000, total:1.03*35_000 },
      { matId:"M017", desc:"Concreto 21 MPa (solado base)", unit:"m³", qty:0.04, unitPrice:425_000,total:0.04*425_000},
      { matId:"M001", desc:"Mortero 1:3 (junta und)",       unit:"kg",  qty:1.5,  unitPrice:650,   total:1.5*650    },
      { matId:"M054", desc:"Recebo compactado trasdos",     unit:"m³",  qty:0.05, unitPrice:48_000,total:0.05*48_000 },
    ],
    labor:[
      { category:"Ayudante",  hh:0.35, rate:MO.ayudante, total:0.35*MO.ayudante },
      { category:"Oficial",   hh:0.30, rate:MO.oficial,  total:0.30*MO.oficial  },
    ],
    equipment:[
      { desc:"Herramienta menor", unit:"gl",qty:1, unitPrice:Math.round((0.35*MO.ayudante+0.30*MO.oficial)*0.05), total:Math.round((0.35*MO.ayudante+0.30*MO.oficial)*0.05) },
    ],
    materialsCost:1.03*35_000+0.04*425_000+1.5*650+0.05*48_000,
    laborCost:0.35*MO.ayudante+0.30*MO.oficial,
    get equipmentCost(){ return Math.round(this.laborCost*0.05) },
    get totalCost(){ return this.materialsCost+this.laborCost+this.equipmentCost }
  },
]

// ── Resumen de APUs ────────────────────────────────────────────
export const apuGroups = [
  { group:"Demolición",           count:3,  codes:["APU-001","APU-002","APU-003"] },
  { group:"Excavación",           count:6,  codes:["APU-004","APU-005","APU-006","APU-007","APU-008","APU-009"] },
  { group:"Cimentación",          count:6,  codes:["APU-010","APU-011","APU-012","APU-013","APU-014","APU-015"] },
  { group:"Estructura Concreto",  count:7,  codes:["APU-016","APU-017","APU-018","APU-019","APU-020","APU-021","APU-022"] },
  { group:"Cubierta Metálica",    count:3,  codes:["APU-023","APU-024","APU-025"] },
  { group:"Mampostería",          count:5,  codes:["APU-026","APU-027","APU-028","APU-029","APU-030"] },
  { group:"Pisos Acabados",       count:5,  codes:["APU-031","APU-032","APU-033","APU-034","APU-035"] },
  { group:"Cubierta",             count:3,  codes:["APU-036","APU-037","APU-038"] },
  { group:"Hidrosanitaria",       count:5,  codes:["APU-039","APU-040","APU-041","APU-042","APU-043"] },
  { group:"Eléctrico",            count:5,  codes:["APU-044","APU-045","APU-046","APU-047","APU-048"] },
  { group:"Vías Pavimentos",      count:2,  codes:["APU-049","APU-050"] },
]
