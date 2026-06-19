// Catálogo de materiales — Constructora Andina S.A.S.
// Precios puestos en obra · Bogotá D.C. · Junio 2026
// Fuente: Listas de precios Argos, Holcim, PAVCO, Schneider · CAMACOL

export interface Material {
  id: string
  name: string
  cat: string
  catLabel: string
  unit: string
  price: number          // COP puestos en obra
  spec: string
  supplier: string
  lastUpdate: string
}

export const materiales: Material[] = [
  // ── CAT 1 — Cementos y conglomerantes (M001–M015) ─────────────
  { id:"M001", name:"Cemento Portland Tipo I",              cat:"C1", catLabel:"Cementos",    unit:"kg",   price:650,        spec:"NTC 121 · 28 MPa · saco 50 kg",                         supplier:"Argos / Holcim",          lastUpdate:"2026-06-01" },
  { id:"M002", name:"Cemento Portland Tipo III (fragua rápida)", cat:"C1", catLabel:"Cementos", unit:"kg", price:760,       spec:"NTC 121 · alta resistencia inicial · saco 50 kg",       supplier:"Argos / CEMEX",           lastUpdate:"2026-06-01" },
  { id:"M003", name:"Cemento blanco",                       cat:"C1", catLabel:"Cementos",    unit:"kg",   price:1_880,      spec:"NTC 321 · saco 25 kg · acabados decorativos",            supplier:"Cementos Blancos Colombia",lastUpdate:"2026-06-01" },
  { id:"M004", name:"Cal hidratada",                        cat:"C1", catLabel:"Cementos",    unit:"kg",   price:380,        spec:"NTC 248 · saco 25 kg · morteros y estucos",              supplier:"Locería Colombiana",       lastUpdate:"2026-06-01" },
  { id:"M005", name:"Mortero seco premezclado pega-ladrillo", cat:"C1", catLabel:"Cementos",  unit:"kg",  price:740,        spec:"NTC 3546 · saco 40 kg · uso albañilería",                supplier:"Beton / Weber Saint-Gobain",lastUpdate:"2026-06-01" },
  { id:"M006", name:"Mortero autonivelante",                cat:"C1", catLabel:"Cementos",    unit:"kg",   price:1_240,      spec:"e=5-50 mm · saco 25 kg · pisos interiores",              supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M007", name:"Grout no retráctil Sika Grout-212",    cat:"C1", catLabel:"Cementos",    unit:"kg",   price:2_080,      spec:"saco 25 kg · anclajes y placas base",                    supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M008", name:"Lechada de cemento",                   cat:"C1", catLabel:"Cementos",    unit:"kg",   price:650,        spec:"1:1 cemento-agua · sellado juntas",                       supplier:"Producción en sitio",      lastUpdate:"2026-06-01" },
  { id:"M009", name:"Aditivo plastificante Sika Plastiment", cat:"C1", catLabel:"Cementos",   unit:"L",   price:9_800,      spec:"reductor de agua 6-8% · bidón 200 L",                    supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M010", name:"Aditivo superplastificante Sikament-290", cat:"C1", catLabel:"Cementos", unit:"L",   price:14_500,     spec:"reductor de agua >25% · alta resistencia",               supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M011", name:"Aditivo retardante Plastiment BV-40", cat:"C1", catLabel:"Cementos",     unit:"L",   price:12_800,     spec:"retardo fragua 2-6 h · climas cálidos",                  supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M012", name:"Aditivo acelerador Sika-2",            cat:"C1", catLabel:"Cementos",    unit:"kg",  price:8_400,      spec:"acelerador sin cloruro · saco 25 kg",                    supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M013", name:"Fibra sintética polipropileno",        cat:"C1", catLabel:"Cementos",    unit:"kg",  price:14_200,     spec:"L=12 mm · dosis 600 g/m³ concreto",                      supplier:"Proplas / Fibermesh",      lastUpdate:"2026-06-01" },
  { id:"M014", name:"Impermeabilizante integral Sika-1",    cat:"C1", catLabel:"Cementos",    unit:"kg",  price:8_900,      spec:"dosis 3 kg/saco cemento · bidón 25 kg",                  supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M015", name:"Desmoldante para formaleta",           cat:"C1", catLabel:"Cementos",    unit:"L",   price:6_800,      spec:"base aceite mineral · rendimiento 40 m²/L",              supplier:"Sika / Euco",              lastUpdate:"2026-06-01" },

  // ── CAT 2 — Concretos premezclados (M016–M023) ────────────────
  { id:"M016", name:"Concreto premezclado 17.5 MPa (2500 PSI)", cat:"C2", catLabel:"Concretos", unit:"m³", price:395_000,  spec:"NTC 3318 · TMA 25mm · asentamiento 10 cm",              supplier:"Argos Ready Mix / IMER",   lastUpdate:"2026-06-01" },
  { id:"M017", name:"Concreto premezclado 21 MPa (3000 PSI)",   cat:"C2", catLabel:"Concretos", unit:"m³", price:425_000,  spec:"NTC 3318 · TMA 19mm · asentamiento 10 cm",              supplier:"Argos Ready Mix / IMER",   lastUpdate:"2026-06-01" },
  { id:"M018", name:"Concreto premezclado 24 MPa (3500 PSI)",   cat:"C2", catLabel:"Concretos", unit:"m³", price:455_000,  spec:"NTC 3318 · TMA 19mm",                                    supplier:"Argos Ready Mix / IMER",   lastUpdate:"2026-06-01" },
  { id:"M019", name:"Concreto premezclado 28 MPa (4000 PSI)",   cat:"C2", catLabel:"Concretos", unit:"m³", price:485_000,  spec:"NTC 3318 · TMA 19mm · elementos estructurales",          supplier:"Argos Ready Mix / IMER",   lastUpdate:"2026-06-01" },
  { id:"M020", name:"Concreto premezclado 35 MPa (5000 PSI)",   cat:"C2", catLabel:"Concretos", unit:"m³", price:548_000,  spec:"NTC 3318 · alta resistencia · columnas y muros",         supplier:"Argos Ready Mix / IMER",   lastUpdate:"2026-06-01" },
  { id:"M021", name:"Concreto premezclado 42 MPa (6000 PSI)",   cat:"C2", catLabel:"Concretos", unit:"m³", price:625_000,  spec:"NTC 3318 · elementos especiales / puentes",              supplier:"Argos Ready Mix",          lastUpdate:"2026-06-01" },
  { id:"M022", name:"Concreto ciclópeo (60% concreto 21MPa + 40% piedra rajón)", cat:"C2", catLabel:"Concretos", unit:"m³", price:285_000, spec:"cimientos corridos y contrafuertes",  supplier:"Producción en sitio",      lastUpdate:"2026-06-01" },
  { id:"M023", name:"Concreto lanzado (shotcrete) 28 MPa",      cat:"C2", catLabel:"Concretos", unit:"m³", price:680_000,  spec:"vía húmeda · estabilización de taludes",                 supplier:"Argos / Contech",          lastUpdate:"2026-06-01" },

  // ── CAT 3 — Acero de refuerzo (M024–M035) ─────────────────────
  { id:"M024", name:"Varilla corrugada 3/8\" (No.3) Gr60",  cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_050,      spec:"NTC 2289 · Gr60 · longitud 6 m",                         supplier:"Ternium / Acerías Paz del Río",lastUpdate:"2026-06-01" },
  { id:"M025", name:"Varilla corrugada 1/2\" (No.4) Gr60",  cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_050,      spec:"NTC 2289 · Gr60 · longitud 6 m",                         supplier:"Ternium / Acerías Paz del Río",lastUpdate:"2026-06-01" },
  { id:"M026", name:"Varilla corrugada 5/8\" (No.5) Gr60",  cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_050,      spec:"NTC 2289 · Gr60 · longitud 6 m",                         supplier:"Ternium / Acerías Paz del Río",lastUpdate:"2026-06-01" },
  { id:"M027", name:"Varilla corrugada 3/4\" (No.6) Gr60",  cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_050,      spec:"NTC 2289 · Gr60 · longitud 6 m",                         supplier:"Ternium / Acerías Paz del Río",lastUpdate:"2026-06-01" },
  { id:"M028", name:"Varilla corrugada 1\" (No.8) Gr60",    cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_050,      spec:"NTC 2289 · Gr60 · longitud 6 m",                         supplier:"Ternium / Acerías Paz del Río",lastUpdate:"2026-06-01" },
  { id:"M029", name:"Varilla lisa 1/4\" (estribo)",         cat:"C3", catLabel:"Acero",       unit:"kg",  price:3_150,      spec:"NTC 2289 · Gr60 · estribos y amarres",                   supplier:"Ternium",                  lastUpdate:"2026-06-01" },
  { id:"M030", name:"Malla electrosoldada ME-5 (5mm@150)",  cat:"C3", catLabel:"Acero",       unit:"m²",  price:48_000,     spec:"NTC 2883 · rollo 2.4×6 m · losas y muros",               supplier:"Ternium / Acesco",         lastUpdate:"2026-06-01" },
  { id:"M031", name:"Malla electrosoldada ME-8 (8mm@150)",  cat:"C3", catLabel:"Acero",       unit:"m²",  price:78_000,     spec:"NTC 2883 · rollo 2.4×6 m · losas industriales",          supplier:"Ternium / Acesco",         lastUpdate:"2026-06-01" },
  { id:"M032", name:"Alambre negro recocido No.16",          cat:"C3", catLabel:"Acero",       unit:"kg",  price:4_200,      spec:"para amarre de varillas · rollo 25 kg",                  supplier:"Acesco / Alambre Nacional", lastUpdate:"2026-06-01" },
  { id:"M033", name:"Clavo con cabeza 2.5\"",               cat:"C3", catLabel:"Acero",       unit:"kg",  price:5_800,      spec:"acero galvanizado · para formaleta en madera",           supplier:"Ferretería Industrial",    lastUpdate:"2026-06-01" },
  { id:"M034", name:"Perno de anclaje expansivo 3/8\"×3\"", cat:"C3", catLabel:"Acero",       unit:"und", price:2_800,      spec:"acero galvanizado grado 5 · con tuerca y arandela",      supplier:"Hilti / Fischer",          lastUpdate:"2026-06-01" },
  { id:"M035", name:"Perno de alta resistencia 5/8\"×2\"",  cat:"C3", catLabel:"Acero",       unit:"und", price:4_500,      spec:"ASTM A325 · con tuerca y arandela · estructura metálica",supplier:"Fassi / Ferretería Especial",lastUpdate:"2026-06-01" },

  // ── CAT 4 — Perfiles y láminas metálicas (M036–M045) ──────────
  { id:"M036", name:"Perfil W8×31 (viga de acero)",         cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:6_800,      spec:"ASTM A572 Gr50 · estructura metálica",                   supplier:"Acerías Paz del Río / Ternium",lastUpdate:"2026-06-01" },
  { id:"M037", name:"Perfil W12×65",                        cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:6_800,      spec:"ASTM A572 Gr50 · estructura metálica",                   supplier:"Acerías Paz del Río",      lastUpdate:"2026-06-01" },
  { id:"M038", name:"Perfil HEA 160 (perfil europeo)",      cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:7_200,      spec:"S275 JR · columnas y vigas de celosía",                  supplier:"Importación / Aceros Andinos",lastUpdate:"2026-06-01" },
  { id:"M039", name:"Perfil L 75×75×6 (angular)",          cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:6_500,      spec:"ASTM A36 · ménsulas y arriostramientos",                 supplier:"Acesco / Ternium",         lastUpdate:"2026-06-01" },
  { id:"M040", name:"Perfil tubular cuadrado 100×100×4",    cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:7_400,      spec:"ASTM A500 Gr.C · carpintería metálica",                  supplier:"Acesco",                   lastUpdate:"2026-06-01" },
  { id:"M041", name:"Platina acero 1/4\"",                  cat:"C4", catLabel:"Perfiles",    unit:"kg",  price:6_200,      spec:"ASTM A36 · conexiones y anclajes",                       supplier:"Acesco / Ternium",         lastUpdate:"2026-06-01" },
  { id:"M042", name:"Lámina galvanizada calibre 26 (3.66 m)",cat:"C4", catLabel:"Perfiles",   unit:"und", price:38_500,     spec:"ASTM A653 G90 · cubierta y cerramientos",                supplier:"Ternium / Novacero",       lastUpdate:"2026-06-01" },
  { id:"M043", name:"Lámina ACM (Alucobond) 4 mm",          cat:"C4", catLabel:"Perfiles",    unit:"m²",  price:145_000,    spec:"aluminio-polietileno · fachadas ventiladas",             supplier:"Alucobond / Reynobond",    lastUpdate:"2026-06-01" },
  { id:"M044", name:"Tubería galvanizada cédula 40 2\"",    cat:"C4", catLabel:"Perfiles",    unit:"ml",  price:38_000,     spec:"ASTM A53 · barandas e instalaciones de gas",             supplier:"Tubos Moore / IPCO",       lastUpdate:"2026-06-01" },
  { id:"M045", name:"Plancha metálica antideslizante 4 mm", cat:"C4", catLabel:"Perfiles",    unit:"m²",  price:98_000,     spec:"ASTM A36 · pisos industriales y rampas",                 supplier:"Acesco",                   lastUpdate:"2026-06-01" },

  // ── CAT 5 — Agregados pétreos (M046–M057) ─────────────────────
  { id:"M046", name:"Arena de río lavada",                  cat:"C5", catLabel:"Agregados",   unit:"m³",  price:72_000,     spec:"NTC 174 · modulo finura 2.5-3.2 · morteros y concreto",  supplier:"Triturados Bogotá",        lastUpdate:"2026-06-01" },
  { id:"M047", name:"Arena de peña triturada (cuarzo)",     cat:"C5", catLabel:"Agregados",   unit:"m³",  price:65_000,     spec:"NTC 174 · MF 2.0-2.8 · morteros y estucos",             supplier:"Triturados Andinos",       lastUpdate:"2026-06-01" },
  { id:"M048", name:"Gravilla 3/4\" triturada",             cat:"C5", catLabel:"Agregados",   unit:"m³",  price:88_000,     spec:"NTC 174 · TMA 19mm · concreto estructural",              supplier:"Triturados Bogotá / Concretar",lastUpdate:"2026-06-01" },
  { id:"M049", name:"Gravilla 1/2\" triturada",             cat:"C5", catLabel:"Agregados",   unit:"m³",  price:92_000,     spec:"NTC 174 · TMA 12.5mm · concreto arquitectónico",        supplier:"Triturados Andinos",       lastUpdate:"2026-06-01" },
  { id:"M050", name:"Triturado 1.5\" piedra base",          cat:"C5", catLabel:"Agregados",   unit:"m³",  price:78_000,     spec:"NTC 174 · TMA 38mm · rellenos y drenajes",              supplier:"Triturados de Colombia",   lastUpdate:"2026-06-01" },
  { id:"M051", name:"Piedra rajón",                         cat:"C5", catLabel:"Agregados",   unit:"m³",  price:68_000,     spec:"D=15-30 cm · concreto ciclópeo y gaviones",              supplier:"Canteras Andinas",         lastUpdate:"2026-06-01" },
  { id:"M052", name:"Base granular BG-1",                   cat:"C5", catLabel:"Agregados",   unit:"m³",  price:95_000,     spec:"INV E-213 · CBR≥80% · subrasante vías",                  supplier:"Triturados de Colombia",   lastUpdate:"2026-06-01" },
  { id:"M053", name:"Sub-base granular SBG",                cat:"C5", catLabel:"Agregados",   unit:"m³",  price:82_000,     spec:"INV E-213 · CBR≥30% · estructura pavimento",             supplier:"Triturados de Colombia",   lastUpdate:"2026-06-01" },
  { id:"M054", name:"Recebo compactado (material de sitio)", cat:"C5", catLabel:"Agregados",  unit:"m³",  price:48_000,     spec:"CBR≥10% · rellenos generales",                           supplier:"Producción en sitio",      lastUpdate:"2026-06-01" },
  { id:"M055", name:"Material seleccionado de préstamo",    cat:"C5", catLabel:"Agregados",   unit:"m³",  price:68_000,     spec:"CBR≥15% · libre de materia orgánica",                    supplier:"Fuente aprobada",          lastUpdate:"2026-06-01" },
  { id:"M056", name:"Arena sílice para filtros",            cat:"C5", catLabel:"Agregados",   unit:"kg",  price:850,        spec:"SiO2≥96% · granulometría uniforme D50=0.8mm",            supplier:"Silica Andina",            lastUpdate:"2026-06-01" },
  { id:"M057", name:"Filler mineral calcáreo",              cat:"C5", catLabel:"Agregados",   unit:"kg",  price:380,        spec:"NTC 9036 · pasa tamiz 75μm≥70% · mezclas asfálticas",   supplier:"Triturados de Colombia",   lastUpdate:"2026-06-01" },

  // ── CAT 6 — Mezclas asfálticas (M058–M062) ────────────────────
  { id:"M058", name:"Mezcla asfáltica MDC-19 en caliente",  cat:"C6", catLabel:"Asfaltos",    unit:"ton", price:285_000,    spec:"INV E-748 · capa de rodadura · tránsito medio-alto",     supplier:"Asfaltos Bogotá / Bitunal",lastUpdate:"2026-06-01" },
  { id:"M059", name:"Mezcla asfáltica MDC-25 (capa intermedia)", cat:"C6", catLabel:"Asfaltos", unit:"ton", price:275_000,  spec:"INV E-748 · capa intermedia vías primarias",             supplier:"Asfaltos Bogotá / Bitunal",lastUpdate:"2026-06-01" },
  { id:"M060", name:"Emulsión asfáltica CRL-1 (riego de liga)", cat:"C6", catLabel:"Asfaltos", unit:"L",  price:2_800,      spec:"INV E-811 · antes de capa asfáltica",                    supplier:"Cóndor S.A.",              lastUpdate:"2026-06-01" },
  { id:"M061", name:"Emulsión asfáltica CRR-1 (imprimación)", cat:"C6", catLabel:"Asfaltos",   unit:"L",  price:2_400,      spec:"INV E-811 · imprimación base granular",                  supplier:"Cóndor S.A.",              lastUpdate:"2026-06-01" },
  { id:"M062", name:"Asfalto modificado con polímero SBS",   cat:"C6", catLabel:"Asfaltos",    unit:"kg", price:3_850,      spec:"PG 70-28 · pavimentos de alto tránsito",                 supplier:"Cóndor S.A. / Bitumás",   lastUpdate:"2026-06-01" },

  // ── CAT 7 — Mampostería y prefabricados (M063–M074) ───────────
  { id:"M063", name:"Bloque de arcilla No.4 (12×20×32)",    cat:"C7", catLabel:"Mampostería", unit:"und", price:1_850,      spec:"NTC 4205-1 · R≥2.5 MPa · muro divisorio",               supplier:"Ladrillera Tequendama",    lastUpdate:"2026-06-01" },
  { id:"M064", name:"Bloque de arcilla No.5 (12×22×32)",    cat:"C7", catLabel:"Mampostería", unit:"und", price:2_400,      spec:"NTC 4205-1 · R≥3.0 MPa · muro estructural",             supplier:"Ladrillera Tequendama",    lastUpdate:"2026-06-01" },
  { id:"M065", name:"Bloque de arcilla No.6 (14×22×32)",    cat:"C7", catLabel:"Mampostería", unit:"und", price:3_200,      spec:"NTC 4205-1 · R≥4.0 MPa · muro estructural NSR-10",      supplier:"Ladrillera Tequendama",    lastUpdate:"2026-06-01" },
  { id:"M066", name:"Bloque de concreto No.4 (10×20×40)",   cat:"C7", catLabel:"Mampostería", unit:"und", price:2_600,      spec:"NTC 247 · R≥7 MPa · muros de carga",                     supplier:"Prefabricados Andinos",    lastUpdate:"2026-06-01" },
  { id:"M067", name:"Bloque AAC (concreto celular) 20×20×60",cat:"C7", catLabel:"Mampostería", unit:"und", price:5_800,     spec:"NTC 6028 · 600 kg/m³ · aislamiento térmico-acústico",   supplier:"Ytong / Ecoblock",         lastUpdate:"2026-06-01" },
  { id:"M068", name:"Ladrillo recocido farol (6×12×25)",    cat:"C7", catLabel:"Mampostería", unit:"und", price:1_200,      spec:"NTC 4205-1 · fachadas y acabados",                       supplier:"Ladrillera Santafé",       lastUpdate:"2026-06-01" },
  { id:"M069", name:"Ladrillo prensado (7×14×28)",          cat:"C7", catLabel:"Mampostería", unit:"und", price:2_400,      spec:"NTC 4205-2 · R≥15 MPa · pisos y fachadas",              supplier:"Ladrillera Tequendama",    lastUpdate:"2026-06-01" },
  { id:"M070", name:"Adoquín de concreto 20×10×8 cm",       cat:"C7", catLabel:"Mampostería", unit:"und", price:1_800,      spec:"NTC 2017 · R≥35 MPa · zonas peatonales",                 supplier:"Prefabricados Bogotá",     lastUpdate:"2026-06-01" },
  { id:"M071", name:"Sardinel prefabricado tipo A",          cat:"C7", catLabel:"Mampostería", unit:"ml",  price:35_000,     spec:"NTC 1961 · 50×30×15 cm · borde de vía",                 supplier:"Prefabricados Andinos",    lastUpdate:"2026-06-01" },
  { id:"M072", name:"Bordillo cuneta prefabricado",          cat:"C7", catLabel:"Mampostería", unit:"ml",  price:68_000,     spec:"NTC 1961 · fondeo + bordillo · cuneta vial",             supplier:"Prefabricados Bogotá",     lastUpdate:"2026-06-01" },
  { id:"M073", name:"Panel Durapanel (yeso+poliestireno)",   cat:"C7", catLabel:"Mampostería", unit:"m²",  price:68_000,     spec:"e=120 mm · muros livianos con mortero proyectado",       supplier:"Durapanel Colombia",       lastUpdate:"2026-06-01" },
  { id:"M074", name:"Teja fibrocemento ondulada",            cat:"C7", catLabel:"Mampostería", unit:"m²",  price:28_500,     spec:"Eterboard · e=6 mm · cubiertas livianas",                supplier:"Eternit Colombia",         lastUpdate:"2026-06-01" },

  // ── CAT 8 — Impermeabilizantes y sellantes (M075–M084) ────────
  { id:"M075", name:"Membrana asfáltica bituminosa 4 mm",    cat:"C8", catLabel:"Impermeable", unit:"m²",  price:42_000,    spec:"APP modificada · con poliéster · cubierta y terraza",    supplier:"Impersa / Sika",           lastUpdate:"2026-06-01" },
  { id:"M076", name:"Impermeabilizante acrílico Sikalastic-560", cat:"C8", catLabel:"Impermeable", unit:"L", price:38_000,  spec:"2 manos · terrazas y cubiertas en uso",                  supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M077", name:"Mortero impermeabilizante cristalizante",cat:"C8", catLabel:"Impermeable", unit:"kg",  price:8_400,     spec:"Vandex BB75 · fundaciones en contacto con agua",         supplier:"MC-Bauchemie",             lastUpdate:"2026-06-01" },
  { id:"M078", name:"Sellante de poliuretano Sikaflex-11FC", cat:"C8", catLabel:"Impermeable", unit:"und", price:32_000,    spec:"cartucho 600 ml · juntas de movimiento",                 supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M079", name:"Silicona estructural neutra Dow 995",   cat:"C8", catLabel:"Impermeable", unit:"und", price:68_000,    spec:"cartucho 300 ml · fachadas de vidrio y metal",           supplier:"Dow Silicones",            lastUpdate:"2026-06-01" },
  { id:"M080", name:"Foam de poliuretano en spray 750ml",    cat:"C8", catLabel:"Impermeable", unit:"und", price:28_000,    spec:"expansión libre 140 L · relleno y sellado",              supplier:"Espumador / Great Stuff",  lastUpdate:"2026-06-01" },
  { id:"M081", name:"Geomembrana HDPE 1 mm Lisa",            cat:"C8", catLabel:"Impermeable", unit:"m²",  price:18_500,    spec:"ASTM D4833 · impermeabilización en piscinas y piscinas",supplier:"Pavco / Solmax",           lastUpdate:"2026-06-01" },
  { id:"M082", name:"Geomembrana HDPE 1.5 mm Texturizada",   cat:"C8", catLabel:"Impermeable", unit:"m²",  price:28_000,    spec:"ASTM D4833 · cara texturizada · rellenos sanitarios",    supplier:"Pavco / Solmax",           lastUpdate:"2026-06-01" },
  { id:"M083", name:"Membrana bentonítica Voltex 4.8 kg/m²", cat:"C8", catLabel:"Impermeable", unit:"m²",  price:52_000,    spec:"ASTM D5887 · cimientos y muros de contención",           supplier:"CETCO / Bentomat",         lastUpdate:"2026-06-01" },
  { id:"M084", name:"Pintura epóxica para concreto",         cat:"C8", catLabel:"Impermeable", unit:"L",   price:85_000,    spec:"2 componentes · piso industrial · resistencia química",  supplier:"Pintuco / Sherwin-Williams",lastUpdate:"2026-06-01" },

  // ── CAT 9 — Tubería PVC presión y sanitaria (M085–M098) ───────
  { id:"M085", name:"Tubería PVC presión 1/2\" RDE-21",      cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:4_800,     spec:"NTC 1277 · PN 200 PSI · instalaciones domésticas",       supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M086", name:"Tubería PVC presión 3/4\" RDE-21",      cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:7_200,     spec:"NTC 1277 · PN 200 PSI",                                  supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M087", name:"Tubería PVC presión 1\" RDE-21",        cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:10_500,    spec:"NTC 1277 · PN 200 PSI",                                  supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M088", name:"Tubería PVC presión 2\" RDE-21",        cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:22_500,    spec:"NTC 1277 · PN 200 PSI · redes secundarias",              supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M089", name:"Tubería PVC presión 4\" RDE-21",        cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:58_000,    spec:"NTC 1277 · PN 200 PSI · redes principales",              supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M090", name:"Tubería PVC presión 6\" RDE-26",        cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:115_000,   spec:"NTC 1277 · PN 160 PSI · distribución",                   supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M091", name:"Tubería PVC sanitaria 2\"",             cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:8_500,     spec:"NTC 1339 · desagüe lavamanos y bajantes",                supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M092", name:"Tubería PVC sanitaria 3\"",             cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:14_200,    spec:"NTC 1339 · bajantes y ramales",                          supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M093", name:"Tubería PVC sanitaria 4\"",             cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:22_000,    spec:"NTC 1339 · colectores horizontales",                     supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M094", name:"Tubería PVC sanitaria 6\"",             cat:"C9", catLabel:"PVC Tuberías",unit:"ml",  price:52_000,    spec:"NTC 1339 · colectores principales",                      supplier:"PAVCO / Mexichem",         lastUpdate:"2026-06-01" },
  { id:"M095", name:"Codo 90° PVC 4\" sanitaria",            cat:"C9", catLabel:"PVC Tuberías",unit:"und", price:12_500,    spec:"NTC 1339 · radio largo",                                 supplier:"PAVCO",                    lastUpdate:"2026-06-01" },
  { id:"M096", name:"Tee PVC sanitaria 4\"",                 cat:"C9", catLabel:"PVC Tuberías",unit:"und", price:18_200,    spec:"NTC 1339 · derivaciones sanitarias",                     supplier:"PAVCO",                    lastUpdate:"2026-06-01" },
  { id:"M097", name:"Reducción PVC 4\"×2\"",                 cat:"C9", catLabel:"PVC Tuberías",unit:"und", price:7_800,     spec:"NTC 1339 · transición de diámetros",                     supplier:"PAVCO",                    lastUpdate:"2026-06-01" },
  { id:"M098", name:"Válvula de compuerta 4\" brida",        cat:"C9", catLabel:"PVC Tuberías",unit:"und", price:285_000,   spec:"AWWA C509 · hierro fundido · redes de acueducto",        supplier:"Val-matic / AVK",          lastUpdate:"2026-06-01" },

  // ── CAT 10 — Tubería HDPE y accesorios (M099–M106) ────────────
  { id:"M099", name:"Tubería HDPE 63mm PE100 PN10",          cat:"C10",catLabel:"HDPE",        unit:"ml",  price:38_000,    spec:"NTC 3721 · conexión por termofusión · agua potable",     supplier:"PAVCO / Durman",           lastUpdate:"2026-06-01" },
  { id:"M100", name:"Tubería HDPE 110mm PE100 PN10",         cat:"C10",catLabel:"HDPE",        unit:"ml",  price:68_000,    spec:"NTC 3721 · red de distribución agua potable",            supplier:"PAVCO / Durman",           lastUpdate:"2026-06-01" },
  { id:"M101", name:"Tubería HDPE 160mm PE100 PN10",         cat:"C10",catLabel:"HDPE",        unit:"ml",  price:125_000,   spec:"NTC 3721 · red principal acueducto",                     supplier:"PAVCO / Durman",           lastUpdate:"2026-06-01" },
  { id:"M102", name:"Tubería HDPE 200mm PE100 PN10",         cat:"C10",catLabel:"HDPE",        unit:"ml",  price:198_000,   spec:"NTC 3721 · conducción de agua tratada",                  supplier:"PAVCO / Durman",           lastUpdate:"2026-06-01" },
  { id:"M103", name:"Tubería HDPE 315mm PE100 PN6",          cat:"C10",catLabel:"HDPE",        unit:"ml",  price:385_000,   spec:"NTC 3721 · colectores y emisarios",                      supplier:"PAVCO / Durman",           lastUpdate:"2026-06-01" },
  { id:"M104", name:"Codo HDPE 90° SDR11 110mm electrofusión",cat:"C10",catLabel:"HDPE",      unit:"und", price:185_000,   spec:"PE100 · electrofusión · radio corto",                    supplier:"PAVCO / Plasson",          lastUpdate:"2026-06-01" },
  { id:"M105", name:"Tee HDPE SDR11 110mm electrofusión",    cat:"C10",catLabel:"HDPE",        unit:"und", price:245_000,   spec:"PE100 · electrofusión",                                  supplier:"PAVCO / Plasson",          lastUpdate:"2026-06-01" },
  { id:"M106", name:"Válvula bola HDPE 110mm bridada",       cat:"C10",catLabel:"HDPE",        unit:"und", price:685_000,   spec:"PN10 · hierro fundido recubierto · acueducto",           supplier:"VAG / Erhard",             lastUpdate:"2026-06-01" },

  // ── CAT 11 — Instalaciones eléctricas (M107–M124) ─────────────
  { id:"M107", name:"Cable THW-LS 12 AWG (2.5mm²)",         cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:2_800,     spec:"NTC 2230 · 600V · negro/rojo/blanco",                    supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M108", name:"Cable THW-LS 10 AWG (4mm²)",           cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:4_200,     spec:"NTC 2230 · 600V · circuitos de 30A",                     supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M109", name:"Cable THW-LS 8 AWG (6mm²)",            cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:7_800,     spec:"NTC 2230 · 600V · circuitos de 40A",                     supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M110", name:"Cable THW-LS 6 AWG (10mm²)",           cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:12_500,    spec:"NTC 2230 · 600V · alimentadores",                        supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M111", name:"Cable THHN 4 AWG (16mm²)",             cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:18_500,    spec:"NTC 2230 · 600V · acometidas y alimentadores",           supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M112", name:"Cable encauchetado 3×12 AWG",          cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:8_500,     spec:"NTC 2573 · 600V · equipos monofásicos",                  supplier:"Centelsa / Procables",     lastUpdate:"2026-06-01" },
  { id:"M113", name:"Conduit EMT 3/4\"",                    cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:8_500,     spec:"NTC 2084 · acero galvanizado liviano · interior",        supplier:"Conduit de Colombia",      lastUpdate:"2026-06-01" },
  { id:"M114", name:"Conduit EMT 1\"",                      cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:12_800,    spec:"NTC 2084 · acero galvanizado · alimentadores",           supplier:"Conduit de Colombia",      lastUpdate:"2026-06-01" },
  { id:"M115", name:"Conduit PVC 3/4\" (Duploflex)",        cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:4_200,     spec:"NTC 4468 · embutido en losa / exterior húmedo",          supplier:"PAVCO / Conduit de Colombia",lastUpdate:"2026-06-01" },
  { id:"M116", name:"Conduit rígido IMC 1\"",               cat:"C11",catLabel:"Eléctrico",   unit:"ml",  price:16_500,    spec:"NTC 2084 · acero galvanizado pesado · exterior",         supplier:"Conduit de Colombia",      lastUpdate:"2026-06-01" },
  { id:"M117", name:"Tablero distribución 12 circuitos 220V", cat:"C11",catLabel:"Eléctrico", unit:"und", price:285_000,   spec:"RETIE · conchado · con barras y puerta",                 supplier:"Schneider / ABB",          lastUpdate:"2026-06-01" },
  { id:"M118", name:"Tablero distribución 24 circuitos 220V", cat:"C11",catLabel:"Eléctrico", unit:"und", price:485_000,   spec:"RETIE · conchado · con barras y puerta",                 supplier:"Schneider / ABB",          lastUpdate:"2026-06-01" },
  { id:"M119", name:"Breaker monopolar 20A (2 polos para 220V)", cat:"C11",catLabel:"Eléctrico",unit:"und",price:38_000,  spec:"RETIE · 10 kA · riel DIN",                               supplier:"Schneider / Siemens",      lastUpdate:"2026-06-01" },
  { id:"M120", name:"Breaker bipolar 40A",                   cat:"C11",catLabel:"Eléctrico",   unit:"und", price:72_000,   spec:"RETIE · 10 kA · circuitos de fuerza",                    supplier:"Schneider / Siemens",      lastUpdate:"2026-06-01" },
  { id:"M121", name:"Breaker tripolar 3×60A",                cat:"C11",catLabel:"Eléctrico",   unit:"und", price:148_000,  spec:"RETIE · 25 kA · acometida y subalimentador",             supplier:"Schneider / ABB",          lastUpdate:"2026-06-01" },
  { id:"M122", name:"Tomacorriente doble 20A 3 polos",       cat:"C11",catLabel:"Eléctrico",   unit:"und", price:28_500,   spec:"RETIE · con polo a tierra · marco y tapa",               supplier:"Legrand / Schneider",      lastUpdate:"2026-06-01" },
  { id:"M123", name:"Panel LED 2×2 40W 3000K",               cat:"C11",catLabel:"Eléctrico",   unit:"und", price:145_000,  spec:"IP44 · 4000 lúmenes · para embutir en cielo raso",       supplier:"Philips / Ledvance",       lastUpdate:"2026-06-01" },
  { id:"M124", name:"Luminaria LED tubular 18W T8",          cat:"C11",catLabel:"Eléctrico",   unit:"und", price:28_000,   spec:"IP20 · 1800 lúmenes · 6500K · vida 50000 h",             supplier:"Philips / GE",             lastUpdate:"2026-06-01" },

  // ── CAT 12 — Pisos y recubrimientos (M125–M140) ───────────────
  { id:"M125", name:"Porcelanato 60×60 cm mate rectificado", cat:"C12",catLabel:"Pisos",       unit:"m²",  price:85_000,    spec:"ISO 10545 · absorción ≤0.5% · uso residencial",          supplier:"Corona / Porcelana CR",    lastUpdate:"2026-06-01" },
  { id:"M126", name:"Porcelanato 60×120 cm polido",          cat:"C12",catLabel:"Pisos",       unit:"m²",  price:145_000,   spec:"ISO 10545 · rectificado · uso comercial premium",        supplier:"Corona / Novaceramic",     lastUpdate:"2026-06-01" },
  { id:"M127", name:"Cerámica piso 40×40 antideslizante",    cat:"C12",catLabel:"Pisos",       unit:"m²",  price:48_000,    spec:"NTC 4321 · R10 · uso residencial húmedo",               supplier:"Corona / Cerámica Italia", lastUpdate:"2026-06-01" },
  { id:"M128", name:"Cerámica pared 30×60 cm",               cat:"C12",catLabel:"Pisos",       unit:"m²",  price:58_000,    spec:"NTC 4321 · baños y cocinas",                             supplier:"Corona / Cerámica Italia", lastUpdate:"2026-06-01" },
  { id:"M129", name:"Piso vinílico LVT 4mm click-lock",      cat:"C12",catLabel:"Pisos",       unit:"m²",  price:72_000,    spec:"AC4 · uso comercial · impermeable · sin glue",           supplier:"Floorest / Karndean",      lastUpdate:"2026-06-01" },
  { id:"M130", name:"Piso epóxico autonivelante 3mm",        cat:"C12",catLabel:"Pisos",       unit:"m²",  price:95_000,    spec:"2 componentes · resistencia química · industrial",        supplier:"Sika / Polyflor",          lastUpdate:"2026-06-01" },
  { id:"M131", name:"Pegante flexible para porcelanato",     cat:"C12",catLabel:"Pisos",       unit:"kg",  price:1_140,     spec:"Weber.col flex · saco 25 kg · C2TE",                     supplier:"Weber Saint-Gobain",       lastUpdate:"2026-06-01" },
  { id:"M132", name:"Boquilla (junta de porcelanato) Sika",  cat:"C12",catLabel:"Pisos",       unit:"kg",  price:9_400,     spec:"saco 2 kg · varios colores · resistente agua",           supplier:"Sika Colombia",            lastUpdate:"2026-06-01" },
  { id:"M133", name:"Mármol Blanco Macael (importado) 2cm", cat:"C12",catLabel:"Pisos",       unit:"m²",  price:320_000,   spec:"pulido brillante · para lobbies y baños premium",        supplier:"Mármoles de Colombia",     lastUpdate:"2026-06-01" },
  { id:"M134", name:"Piedra bogotana (labrada)",              cat:"C12",catLabel:"Pisos",       unit:"m²",  price:145_000,   spec:"e=3-5 cm · andenes y zonas exteriores",                  supplier:"Canteras de Boyacá",       lastUpdate:"2026-06-01" },
  { id:"M135", name:"Madera bambú laminada 15mm",            cat:"C12",catLabel:"Pisos",       unit:"m²",  price:125_000,   spec:"Janka 1380 · flotante click · pisos interiores",         supplier:"Bambuver / Bambú Colombia", lastUpdate:"2026-06-01" },
  { id:"M136", name:"Alfombra comercial modular 50×50",      cat:"C12",catLabel:"Pisos",       unit:"m²",  price:68_000,    spec:"nylon 100% · uso intensivo · oficinas",                  supplier:"Milliken / Shaw Contract",  lastUpdate:"2026-06-01" },
  { id:"M137", name:"Granito natural negro Zimbabwe 2cm",    cat:"C12",catLabel:"Pisos",       unit:"m²",  price:285_000,   spec:"pulido brillante · mesones y pisos especiales",          supplier:"Importación / Granicol",   lastUpdate:"2026-06-01" },
  { id:"M138", name:"Deck de madera plástica compuesta 25mm",cat:"C12",catLabel:"Pisos",       unit:"m²",  price:185_000,   spec:"WPC · 25×145 mm · terrazas y exteriores",               supplier:"Composite Prime / Cedral", lastUpdate:"2026-06-01" },
  { id:"M139", name:"Piso de microcemento 3mm acabado premium",cat:"C12",catLabel:"Pisos",     unit:"m²",  price:145_000,   spec:"2 capas + barniz PU · continuo sin juntas",              supplier:"Topcret / Microtopping",   lastUpdate:"2026-06-01" },
  { id:"M140", name:"Loseta caucho reciclado 10mm (gimnasio)",cat:"C12",catLabel:"Pisos",      unit:"m²",  price:75_000,    spec:"densidad 650 kg/m³ · antichoque · gyms y laboratorios", supplier:"Caucho Hercal / Regupol",  lastUpdate:"2026-06-01" },

  // ── CAT 13 — Pinturas y estucos (M141–M148) ───────────────────
  { id:"M141", name:"Vinilo tipo 1 extra (interior)",        cat:"C13",catLabel:"Pinturas",    unit:"galón",price:58_000,   spec:"NTC 1335 · alto PVC · 2 manos · 10 m²/galón",           supplier:"Pintuco / Sherwin",        lastUpdate:"2026-06-01" },
  { id:"M142", name:"Vinilo tipo 2 (exterior intemperie)",   cat:"C13",catLabel:"Pinturas",    unit:"galón",price:78_000,   spec:"NTC 1335 · resistente UV y lluvia · 8 m²/galón",        supplier:"Pintuco / Sherwin",        lastUpdate:"2026-06-01" },
  { id:"M143", name:"Esmalte sintético para metal",          cat:"C13",catLabel:"Pinturas",    unit:"galón",price:68_000,   spec:"alkídico · acabado brillante · sobre anticorrosivo",     supplier:"Pintuco / Abro",           lastUpdate:"2026-06-01" },
  { id:"M144", name:"Pintura anticorrosiva rojo óxido",      cat:"C13",catLabel:"Pinturas",    unit:"galón",price:82_000,   spec:"alkídica · 2 manos · estructuras metálicas",             supplier:"Pintuco / Loxon",          lastUpdate:"2026-06-01" },
  { id:"M145", name:"Estuco plástico acrílico interior",     cat:"C13",catLabel:"Pinturas",    unit:"galón",price:38_000,   spec:"para lijar · 2 manos · base para vinilo",               supplier:"Pintuco / Corona",         lastUpdate:"2026-06-01" },
  { id:"M146", name:"Pintura textural exterior Texkote",     cat:"C13",catLabel:"Pinturas",    unit:"galón",price:125_000,  spec:"acrílico elástomérico · impermeabilizante · fachadas",  supplier:"Pintuco / SherWin",        lastUpdate:"2026-06-01" },
  { id:"M147", name:"Barniz poliuretano (2 componentes)",    cat:"C13",catLabel:"Pinturas",    unit:"galón",price:185_000,  spec:"para pisos de madera · alto tránsito · 3 manos",        supplier:"Renner / Sayerlack",       lastUpdate:"2026-06-01" },
  { id:"M148", name:"Sellador acílico de poros",             cat:"C13",catLabel:"Pinturas",    unit:"galón",price:32_000,   spec:"para concreto y mampostería · base para pintura",        supplier:"Pintuco",                  lastUpdate:"2026-06-01" },

  // ── CAT 14 — Drywall y cielo raso (M149–M156) ─────────────────
  { id:"M149", name:"Lámina drywall 1/2\" estándar (1.22×2.44 m)",cat:"C14",catLabel:"Drywall",unit:"und",price:38_500,   spec:"NTC 4373 · muros y divisiones secas",                    supplier:"Gyplac / USG",             lastUpdate:"2026-06-01" },
  { id:"M150", name:"Lámina drywall RH 1/2\" (Resistente Humedad)", cat:"C14",catLabel:"Drywall",unit:"und",price:52_000, spec:"NTC 4373 · baños y zonas húmedas",                       supplier:"Gyplac / USG",             lastUpdate:"2026-06-01" },
  { id:"M151", name:"Lámina drywall RF 5/8\" (Resistente Fuego)",   cat:"C14",catLabel:"Drywall",unit:"und",price:68_000, spec:"NTC 4373 · F60-F120 · edificios de altura",              supplier:"Gyplac / USG",             lastUpdate:"2026-06-01" },
  { id:"M152", name:"Perfil canaleta RH 62 (3.05 m)",        cat:"C14",catLabel:"Drywall",    unit:"ml",  price:12_800,    spec:"galvanizado cal.26 · guía horizontal muro",             supplier:"Gyplac / Instacol",        lastUpdate:"2026-06-01" },
  { id:"M153", name:"Perfil parante RH 62 (3.05 m)",         cat:"C14",catLabel:"Drywall",    unit:"ml",  price:8_400,     spec:"galvanizado cal.26 · montante vertical",                 supplier:"Gyplac / Instacol",        lastUpdate:"2026-06-01" },
  { id:"M154", name:"Pasta de juntas drywall (cuñete 28 kg)", cat:"C14",catLabel:"Drywall",   unit:"und", price:75_000,    spec:"secado al aire · para cintas y acabado",                 supplier:"Gyplac / USG",             lastUpdate:"2026-06-01" },
  { id:"M155", name:"Cielo raso en fibra mineral 60×60 Armstrong", cat:"C14",catLabel:"Drywall",unit:"m²",price:48_000,  spec:"NRC 0.55 · CAC 35 · oficinas y comercial",               supplier:"Armstrong / Knauf",        lastUpdate:"2026-06-01" },
  { id:"M156", name:"Perfil T principal cielo Armstrong 24mm",cat:"C14",catLabel:"Drywall",   unit:"ml",  price:8_500,     spec:"galvanizado · sistema 60×60 y 60×120",                   supplier:"Armstrong",                lastUpdate:"2026-06-01" },

  // ── CAT 15 — Puertas, ventanas y vidrio (M157–M164) ───────────
  { id:"M157", name:"Puerta metálica 0.90×2.10 m (chapa + cerradura)", cat:"C15",catLabel:"Carpintería",unit:"und",price:780_000, spec:"lámina cold rolled 1.5mm · pintada · 3 bisagras",  supplier:"Puertas Bogotá / Mecanika",lastUpdate:"2026-06-01" },
  { id:"M158", name:"Puerta madera sólida 0.90×2.10 m",       cat:"C15",catLabel:"Carpintería",unit:"und", price:1_250_000, spec:"cedro o sapán · laminada · marco incluido",             supplier:"Carpintería Andina",       lastUpdate:"2026-06-01" },
  { id:"M159", name:"Puerta cortafuego RF60 0.90×2.10 m",     cat:"C15",catLabel:"Carpintería",unit:"und", price:2_850_000, spec:"NSR-10 · con empaque y cierre automático",              supplier:"Puertas Industriales",     lastUpdate:"2026-06-01" },
  { id:"M160", name:"Ventana aluminio marco 4\" vidrio 6mm",   cat:"C15",catLabel:"Carpintería",unit:"m²",  price:285_000,  spec:"serie 100 · aluminio anodizado natural",                 supplier:"Aluminar / Inalco",        lastUpdate:"2026-06-01" },
  { id:"M161", name:"Muro cortina aluminio + vidrio 8mm",      cat:"C15",catLabel:"Carpintería",unit:"m²",  price:680_000,  spec:"sistema TB-50 · RPT · parámetros NSR-10",               supplier:"Cortizo / Technal",        lastUpdate:"2026-06-01" },
  { id:"M162", name:"Vidrio templado incoloro 8mm",            cat:"C15",catLabel:"Carpintería",unit:"m²",  price:185_000,  spec:"NTC 1467 · ESG · mampara, barandas, ventanas",          supplier:"Vitro / AGC Glass",        lastUpdate:"2026-06-01" },
  { id:"M163", name:"Vidrio laminado PVB 6+6 mm",             cat:"C15",catLabel:"Carpintería",unit:"m²",  price:285_000,  spec:"NTC 1467 · VSG · piso elevado y cielos raso vidrio",    supplier:"Vitro / AGC Glass",        lastUpdate:"2026-06-01" },
  { id:"M164", name:"Espejo biselado 4mm instalado",           cat:"C15",catLabel:"Carpintería",unit:"m²",  price:145_000,  spec:"incluye fijación clip + pegante silicona",               supplier:"Vitro / Vidrio Templado",  lastUpdate:"2026-06-01" },

  // ── CAT 16 — Geosintéticos y control de erosión (M165–M174) ───
  { id:"M165", name:"Geotextil no tejido NT-1600 100 g/m²",   cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:3_800,   spec:"NTC 2451 · filtración y separación",                     supplier:"Pavco / Proplas",          lastUpdate:"2026-06-01" },
  { id:"M166", name:"Geotextil no tejido NT-3000 200 g/m²",   cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:5_800,   spec:"NTC 2451 · protección geomembrana",                       supplier:"Pavco / Proplas",          lastUpdate:"2026-06-01" },
  { id:"M167", name:"Geotextil tejido GT-150 150 kN/m",       cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:18_500,  spec:"NTC 2451 · refuerzo de suelos blandos",                  supplier:"Pavco / TenCate",          lastUpdate:"2026-06-01" },
  { id:"M168", name:"Geomalla biaxial BX-1200",               cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:22_000,  spec:"HDPE · 20×20 kN/m · refuerzo de base granular",          supplier:"Tensar / Pavco",           lastUpdate:"2026-06-01" },
  { id:"M169", name:"Geodren compuesto 25mm + filtro",         cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:38_500,  spec:"HDPE nódulo + geotextil NT · drenaje vertical",          supplier:"Pavco / Terram",           lastUpdate:"2026-06-01" },
  { id:"M170", name:"Tubería perforada corrugada HDPE 4\"",    cat:"C16",catLabel:"Geosintéticos",unit:"ml",price:18_500,  spec:"ASTM F667 · drenes perimetrales y franceses",            supplier:"Pavco / Durman",           lastUpdate:"2026-06-01" },
  { id:"M171", name:"Tubería perforada corrugada HDPE 6\"",    cat:"C16",catLabel:"Geosintéticos",unit:"ml",price:32_000,  spec:"ASTM F667 · subdrenaje vial",                            supplier:"Pavco / Durman",           lastUpdate:"2026-06-01" },
  { id:"M172", name:"Manta antierosión biodegradable BioD",   cat:"C16",catLabel:"Geosintéticos",unit:"m²",price:8_500,   spec:"fibra de coco · taludes sin cobertura vegetal",          supplier:"TenCate / Proplas",        lastUpdate:"2026-06-01" },
  { id:"M173", name:"Anclaje activo para roca Ø32mm L=6m",    cat:"C16",catLabel:"Geosintéticos",unit:"und",price:285_000, spec:"barra 550MPa · con lechada de cemento",                 supplier:"DSI / ISCHEBECK",          lastUpdate:"2026-06-01" },
  { id:"M174", name:"Micropilote Ø150mm L=12m (incluyendo perforación)", cat:"C16",catLabel:"Geosintéticos",unit:"und",price:5_800_000, spec:"inyectado con cemento · Vult≥500 kN",    supplier:"Cimentaciones Andinas",    lastUpdate:"2026-06-01" },

  // ── CAT 17 — Seguridad industrial (M175–M182) ─────────────────
  { id:"M175", name:"Casco de seguridad ANSI Z89.1 Clase E", cat:"C17",catLabel:"Seguridad",   unit:"und", price:28_000,   spec:"dielectrico · para contacto eléctrico",                  supplier:"3M / MSA Safety",          lastUpdate:"2026-06-01" },
  { id:"M176", name:"Arnés de seguridad anticaída 5 puntos",  cat:"C17",catLabel:"Seguridad",   unit:"und", price:185_000,  spec:"ANSI Z359.11 · para trabajos en altura >1.5m",           supplier:"3M / MSA Safety",          lastUpdate:"2026-06-01" },
  { id:"M177", name:"Línea de vida retráctil 6m",             cat:"C17",catLabel:"Seguridad",   unit:"und", price:385_000,  spec:"ANSI Z359.14 · complemento del arnés",                   supplier:"3M / DBI-Sala",            lastUpdate:"2026-06-01" },
  { id:"M178", name:"Extinguidor polvo ABC 10 libras",        cat:"C17",catLabel:"Seguridad",   unit:"und", price:78_000,   spec:"NTC 2885 · con certificado de recarga",                  supplier:"Extintores Andina / Sievert",lastUpdate:"2026-06-01" },
  { id:"M179", name:"Señal de seguridad informativa",         cat:"C17",catLabel:"Seguridad",   unit:"und", price:12_800,   spec:"Resolución 1409/2012 · fotoluminiscente",                supplier:"Señalización Colombia",    lastUpdate:"2026-06-01" },
  { id:"M180", name:"Valla de cerramiento obra (malla naranja)",cat:"C17",catLabel:"Seguridad", unit:"ml",  price:4_800,    spec:"HDPE 50% sombra · con parales cada 2.5 m",              supplier:"Mallas Andinas",           lastUpdate:"2026-06-01" },
  { id:"M181", name:"Tapabocas N95 (caja×25)",                cat:"C17",catLabel:"Seguridad",   unit:"und", price:185_000,  spec:"Res. 3M 8210 · partículas y polvo de concreto",          supplier:"3M",                       lastUpdate:"2026-06-01" },
  { id:"M182", name:"Gafas de seguridad policarbonato",        cat:"C17",catLabel:"Seguridad",   unit:"und", price:12_500,   spec:"ANSI Z87.1 · antirraya y antiempañante",                 supplier:"3M / Uvex",                lastUpdate:"2026-06-01" },

  // ── CAT 18 — Insumos y consumibles (M183–M200) ────────────────
  { id:"M183", name:"Formaleta metálica alquilada",            cat:"C18",catLabel:"Insumos",    unit:"m²·día",price:8_500,  spec:"plancha 0.60×1.20 m · acero 4 mm · incluye accesorios",supplier:"Formaletas Colombia",      lastUpdate:"2026-06-01" },
  { id:"M184", name:"Formaleta madera pino cepillada 1\"×6\"", cat:"C18",catLabel:"Insumos",   unit:"m²",  price:48_000,   spec:"para vigas y losas de entrepiso",                        supplier:"Maderas el Pino",          lastUpdate:"2026-06-01" },
  { id:"M185", name:"Parales telescópicos 3.5 m (alquiler)",   cat:"C18",catLabel:"Insumos",    unit:"und·día",price:3_200, spec:"capacidad 2.5 ton · apuntalamiento de losas",            supplier:"Apuntalamientos Andinos",  lastUpdate:"2026-06-01" },
  { id:"M186", name:"Andamio tubular multidireccional",        cat:"C18",catLabel:"Insumos",    unit:"m²·día",price:4_800,  spec:"sistema Layher/Ringlock · tarima y rodapiés",            supplier:"Andamios Colombia",        lastUpdate:"2026-06-01" },
  { id:"M187", name:"Madera rolliza (puntilla) 3 m",           cat:"C18",catLabel:"Insumos",    unit:"und", price:12_500,   spec:"D=12-15 cm · apuntalamiento provisional",               supplier:"Maderas del Pacífico",     lastUpdate:"2026-06-01" },
  { id:"M188", name:"Polietileno negro 6 mil (0.15 mm)",       cat:"C18",catLabel:"Insumos",    unit:"m²",  price:2_400,    spec:"barrera de vapor · bajo losa y muros de contención",    supplier:"Proplas / Plastilene",     lastUpdate:"2026-06-01" },
  { id:"M189", name:"Separador plástico para varilla 4cm",     cat:"C18",catLabel:"Insumos",    unit:"und", price:850,      spec:"tipo silla · recubrimiento mínimo concreto",             supplier:"Separadores Bogotá",       lastUpdate:"2026-06-01" },
  { id:"M190", name:"Thinner acrílico (galón)",                cat:"C18",catLabel:"Insumos",    unit:"galón",price:22_000,  spec:"diluyente para pintura acrílica y esmalte",              supplier:"Pintuco / Sherwin",        lastUpdate:"2026-06-01" },
  { id:"M191", name:"Agua potable para construcción",          cat:"C18",catLabel:"Insumos",    unit:"m³",  price:4_800,    spec:"acueducto o carro tanque · según disponibilidad",        supplier:"EAAB / Carro tanque",      lastUpdate:"2026-06-01" },
  { id:"M192", name:"Energía eléctrica provisional obra",       cat:"C18",catLabel:"Insumos",    unit:"kWh", price:850,      spec:"red provisional certificada RETIE · medidor",           supplier:"Codensa / EPM",            lastUpdate:"2026-06-01" },
  { id:"M193", name:"Cinta de enmascarar 2\" (48mm×50m)",      cat:"C18",catLabel:"Insumos",    unit:"und", price:8_500,    spec:"para protección en pinturas y acabados",                 supplier:"3M / Tesa",                lastUpdate:"2026-06-01" },
  { id:"M194", name:"Cinta de seguridad amarilla/negra 200m",  cat:"C18",catLabel:"Insumos",    unit:"und", price:18_500,   spec:"señalización de zonas de peligro",                       supplier:"Cinta Seguridad Colombia", lastUpdate:"2026-06-01" },
  { id:"M195", name:"Acetileno industrial (m³)",                cat:"C18",catLabel:"Insumos",    unit:"m³",  price:28_000,   spec:"pureza 99.5% · soldadura oxiacetilénica",               supplier:"Linde / Air Products",     lastUpdate:"2026-06-01" },
  { id:"M196", name:"Oxígeno industrial (m³)",                  cat:"C18",catLabel:"Insumos",    unit:"m³",  price:8_500,    spec:"pureza 99.5% · soldadura y corte",                       supplier:"Linde / Air Products",     lastUpdate:"2026-06-01" },
  { id:"M197", name:"Disco de corte 9\" para metal (und)",      cat:"C18",catLabel:"Insumos",    unit:"und", price:18_500,   spec:"diamante · vida útil ~50 cortes",                        supplier:"Norton / Bosch",           lastUpdate:"2026-06-01" },
  { id:"M198", name:"Electrodo de soldadura E-6011 3/32\"",    cat:"C18",catLabel:"Insumos",    unit:"kg",  price:12_500,   spec:"AWS A5.1 · para acero estructural",                      supplier:"Lincoln Electric / Indura",lastUpdate:"2026-06-01" },
  { id:"M199", name:"Guantes de nitrilo para obra (par)",       cat:"C18",catLabel:"Insumos",    unit:"par", price:8_500,    spec:"talla M/L · resistencia mecánica nivel 2",              supplier:"Honeywell / Ansell",       lastUpdate:"2026-06-01" },
  { id:"M200", name:"Botín de seguridad dieléctrico punta AC",  cat:"C18",catLabel:"Insumos",   unit:"par", price:145_000,  spec:"Resolución 1409 · certificado ICONTEC",                  supplier:"Ombu / ISSA",              lastUpdate:"2026-06-01" },
]

// ── Estadísticas del catálogo ─────────────────────────────────
export const catalogStats = {
  total: materiales.length,
  porCategoria: [
    { cat: "C1",  label: "Cementos y conglomerantes",        count: 15 },
    { cat: "C2",  label: "Concretos premezclados",           count: 8  },
    { cat: "C3",  label: "Acero de refuerzo",                count: 12 },
    { cat: "C4",  label: "Perfiles y láminas metálicas",     count: 10 },
    { cat: "C5",  label: "Agregados pétreos",                count: 12 },
    { cat: "C6",  label: "Mezclas asfálticas",               count: 5  },
    { cat: "C7",  label: "Mampostería y prefabricados",      count: 12 },
    { cat: "C8",  label: "Impermeabilizantes y sellantes",   count: 10 },
    { cat: "C9",  label: "Tubería PVC",                      count: 14 },
    { cat: "C10", label: "Tubería HDPE y accesorios",        count: 8  },
    { cat: "C11", label: "Instalaciones eléctricas",         count: 18 },
    { cat: "C12", label: "Pisos y recubrimientos",           count: 16 },
    { cat: "C13", label: "Pinturas y estucos",               count: 8  },
    { cat: "C14", label: "Drywall y cielo raso",             count: 8  },
    { cat: "C15", label: "Puertas, ventanas y vidrio",       count: 8  },
    { cat: "C16", label: "Geosintéticos",                    count: 10 },
    { cat: "C17", label: "Seguridad industrial",             count: 8  },
    { cat: "C18", label: "Insumos y consumibles",            count: 18 },
  ],
  precioPromedio:  Math.round(materiales.reduce((s, m) => s + m.price, 0) / materiales.length),
  precioMin:       Math.min(...materiales.map(m => m.price)),
  precioMax:       Math.max(...materiales.map(m => m.price)),
  updatedAt:       "2026-06-01",
}
