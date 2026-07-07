// Frases de referentes del oficio y humor técnico — contenido para <ProfesionQuips />.
// Contrato: cada Quip con autor cita a una persona real y verificable. Si una atribución
// es dudosa, se omite el autor y se deja como máxima anónima del oficio.

export interface Quip {
  tipo: "frase" | "humor"
  texto: string
  autor?: string
}

export const QUIPS: Record<string, Quip[]> = {
  core: [
    {
      tipo: "frase",
      texto: "La calidad no es un acto, es un hábito.",
      autor: "Aristóteles",
    },
    {
      tipo: "frase",
      texto: "El precio es lo que pagas. El valor es lo que recibes.",
      autor: "Warren Buffett",
    },
    {
      tipo: "frase",
      texto: "No hay nada más inútil que hacer con gran eficiencia algo que no debería hacerse en absoluto.",
      autor: "Peter Drucker",
    },
    {
      tipo: "humor",
      texto: "Imagínate a Vitruvio cotizando un APU con firmeza, utilidad y belleza — y el cliente pidiendo descuento igual.",
    },
    {
      tipo: "humor",
      texto: "Da Vinci habría entregado el presupuesto tres siglos tarde, pero con los planos perfectos.",
    },
    {
      tipo: "humor",
      texto: "Si Edison hubiera hecho un presupuesto de obra: '999 partidas que no cuadran antes de encontrar la que sí'.",
    },
    {
      tipo: "humor",
      texto: "Turing estimando este sprint de obra: 'lo indecidible es cuándo llega el cemento'.",
    },
  ],
  topografia: [
    {
      tipo: "frase",
      texto: "Mide lo que se pueda medir, y lo que no, hazlo medible.",
      autor: "Galileo Galilei",
    },
    {
      tipo: "frase",
      texto: "En Dios confiamos; todos los demás, traigan datos.",
      autor: "W. Edwards Deming",
    },
    {
      tipo: "humor",
      texto: "Imagínate a Eratóstenes con esta estación total — midió la Tierra entera con un palo, una sombra y dos ciudades.",
    },
    {
      tipo: "humor",
      texto: "Pitágoras habría cerrado esta poligonal sin compensar y aun así habría insistido en que el triángulo tenía razón.",
    },
    {
      tipo: "humor",
      texto: "Gauss revisando el error de cierre: lo habría repartido por mínimos cuadrados antes del café.",
    },
    {
      tipo: "humor",
      texto: "Los agrimensores egipcios reponían los linderos del Nilo cada inundación — sin GPS, sin dron, sin excusas.",
    },
    {
      tipo: "humor",
      texto: "Imagínate explicarle el datum WGS84 a quien trazó las pirámides alineadas casi perfectas al norte real, a ojo.",
    },
  ],
  informatica: [
    {
      tipo: "frase",
      texto: "La única forma de ir rápido es ir bien.",
      autor: "Robert C. Martin",
    },
    {
      tipo: "frase",
      texto: "La simplicidad es un prerrequisito para la confiabilidad.",
      autor: "Edsger W. Dijkstra",
    },
    {
      tipo: "frase",
      texto: "Añadir más gente a un proyecto tarde lo atrasa aún más.",
      autor: "Fred Brooks",
    },
    {
      tipo: "humor",
      texto: "Turing estimando este sprint: 'lo indecidible es cuándo termina QA'.",
    },
    {
      tipo: "humor",
      texto: "Imagínate a Ada Lovelace con este dashboard de costos cloud — habría documentado el algoritmo antes de que existiera la nube.",
    },
    {
      tipo: "humor",
      texto: "Grace Hopper explicando este bug de producción: 'literalmente hay un insecto ahí, otra vez'.",
    },
    {
      tipo: "humor",
      texto: "Si Turing hiciera code review, el criterio sería simple: si no distingues su commit del de una IA, aprobado.",
    },
  ],
}

export function quipsDe(discipline: string): Quip[] {
  return QUIPS[discipline] ?? []
}
