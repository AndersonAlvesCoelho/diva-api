import { OSNormalized, OSPriority, OSWithPriority } from "../types/os";
import { parseDate } from "../utils/help";
import { getOSFixa, getOSRotativa } from "./graphService";

function parseExcelDate(value: unknown): string | null {
  if (!value && value !== 0) return null;
  if (typeof value === "number") {
    const date = new Date(new Date(1899, 11, 30).getTime() + value * 86400000);
    return date.toLocaleDateString("pt-BR");
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function parseHoras(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(",", "."));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function parseHorasAcionadas(value: unknown): string {
  if (!value && value !== 0) return "0:00";

  let totalMinutes = 0;

  if (typeof value === "number") {
    // Serial do Excel — fração de dia → minutos
    totalMinutes = Math.round(value * 24 * 60);
  } else if (typeof value === "string" && value.trim()) {
    // Já veio formatado como "80:00:00" ou "3:20"
    const parts = value.trim().split(":");
    const h = Number(parts[0] ?? 0);
    const m = Number(parts[1] ?? 0);
    totalMinutes = h * 60 + m;
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function str(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeFixa(raw: Record<string, unknown>): OSNormalized {
  return {
    contrato: str(raw["Contrato"]),
    empresa: str(raw["Empresa"]),
    ordemDeServico: str(raw["Ordem de Serviço"]),
    formulario: "", // não existe na Fixa
    tipo: "Fixa",
    unidadeSolicitante: str(raw["Unidade Solicitante"]),
    base: str(raw["Base"]),
    objetivo: str(raw["Objetivo"]),
    status: str(raw["Status do Acionamento"]), // ← Fixa
    statusContrato: str(raw["Status do Contrato"]),
    tipoAeronave: str(raw["Tipo de Aeronave"]), // ← só na Fixa
    modeloAeronave: str(raw["Modelo da Aeronave"]),
    prefixo: str(raw["Prefixo Aeronaves."]), // ← só na Fixa
    unidade: str(raw["Unidade de Conservação"]), // ← Fixa usa este nome
    cnuc: str(raw["CNUC"]),
    bioma: str(raw["Bioma"]),
    inicioOperacao: parseExcelDate(raw["Inicio da Operação"]),
    finalOperacao: parseExcelDate(raw["Final da Operação"]),
    quantDias: Number(raw["Quant. Dias"] ?? 0),
    quantAeronaves: Number(raw["Quant. Aeronaves"] ?? 0),
    horasAcionadas: parseHorasAcionadas(raw["Horas Acionadas"]),
    totalHorasVoadas: str(raw["Total de Horas Voadas"]),
    horasRemanescentes: str(raw["Horas Remanescentes"]),
    fonteOrcamentaria: str(raw["Fonte Orçamentária "]),
    numeroEmpenho: str(raw["Numero do Empenho"]),
    valorHoraVoo: parseHoras(raw["Valor Hora/Voo"]),
    valorEstimado: parseHoras(raw["Valor Estimado"]),
  };
}

function normalizeRotativa(raw: Record<string, unknown>): OSNormalized {
  return {
    contrato: str(raw["Contrato"]),
    empresa: str(raw["Empresa"]),
    ordemDeServico: str(raw["Ordem de Serviço"]),
    formulario: str(raw["Formulário"]), // ← só na Rotativa
    tipo: "Rotativa",
    unidadeSolicitante: str(raw["Unidade Solicitante"]),
    base: str(raw["Base"]),
    objetivo: str(raw["Objetivo"]),
    status: str(raw["Status"]), // ← Rotativa usa "Status"
    statusContrato: str(raw["Status do Contrato"]),
    tipoAeronave: "", // não existe na Rotativa
    modeloAeronave: str(raw["Modelo da Aeronave"]),
    prefixo: "", // não existe na Rotativa
    unidade: str(raw["Unidade"]), // ← Rotativa usa "Unidade"
    cnuc: str(raw["CNUC"]),
    bioma: str(raw["Bioma"]),
    inicioOperacao: parseExcelDate(raw["Inicio da Operação"]),
    finalOperacao: parseExcelDate(raw["Final da Operação"]),
    quantDias: Number(raw["Quant. Dias"] ?? 0),
    quantAeronaves: Number(raw["Quant. Aeronaves"] ?? 0),
    horasAcionadas: parseHorasAcionadas(raw["Horas Acionadas"]),
    totalHorasVoadas: "", // não existe na Rotativa
    horasRemanescentes: "", // não existe na Rotativa
    fonteOrcamentaria: str(raw["Fonte Orçamentária "]),
    numeroEmpenho: str(raw["Numero do Empenho"]),
    valorHoraVoo: parseHoras(raw["Valor Hora/Voo"]),
    valorEstimado: parseHoras(raw["Valor Estimado"]),
  };
}
function applyPriority(list: OSNormalized[]): OSWithPriority[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const future = list
    .filter((os) => {
      const date = parseDate(os.finalOperacao);
      return date !== null && date >= today;
    })
    .sort((a, b) => {
      const da = parseDate(a.finalOperacao)!.getTime();
      const db = parseDate(b.finalOperacao)!.getTime();
      return da - db; // mais próximas primeiro
    });

  const past = list
    .filter((os) => {
      const date = parseDate(os.finalOperacao);
      return date === null || date < today;
    })
    .sort((a, b) => {
      const da = parseDate(a.finalOperacao)?.getTime() ?? 0;
      const db = parseDate(b.finalOperacao)?.getTime() ?? 0;
      return db - da; // mais recentes primeiro
    });

  const top3Ids = new Set(future.slice(0, 3).map((os) => os.ordemDeServico));

  const withPriority = (os: OSNormalized): OSWithPriority => {
    const date = parseDate(os.finalOperacao);
    const isPast = date === null || date < today;
    const priority: OSPriority = isPast
      ? 3
      : top3Ids.has(os.ordemDeServico)
        ? 1
        : 2;
    return { ...os, prioridade: priority };
  };

  return [
    ...future.slice(0, 3).map(withPriority), // prioridade 1
    ...future.slice(3).map(withPriority), // prioridade 2
    ...past.map(withPriority), // prioridade 3 — mais recentes primeiro
  ];
}
export async function listAllOS(): Promise<OSNormalized[]> {
  const [rotativa, fixa] = await Promise.all([getOSRotativa(), getOSFixa()]);
  const all = [...rotativa.map(normalizeRotativa), ...fixa.map(normalizeFixa)];
  return applyPriority(all);
}

export async function listOSRotativa(): Promise<OSNormalized[]> {
  return (await getOSRotativa()).map(normalizeRotativa);
}

export async function listOSFixa(): Promise<OSNormalized[]> {
  return (await getOSFixa()).map(normalizeFixa);
}
