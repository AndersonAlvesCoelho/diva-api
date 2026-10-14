export interface OSNormalized {
  contrato: string;
  empresa: string;
  ordemDeServico: string;
  formulario: string;
  tipo: "Rotativa" | "Fixa";
  unidadeSolicitante: string;
  base: string;
  objetivo: string;
  status: string;
  statusContrato: string;
  tipoAeronave: string;
  modeloAeronave: string;
  prefixo: string;
  unidade: string;
  cnuc: string;
  bioma: string;
  inicioOperacao: string | null;
  finalOperacao: string | null;
  quantDias: number;
  quantAeronaves: number;
  horasAcionadas: string;
  totalHorasVoadas: string;
  horasRemanescentes: string;
  fonteOrcamentaria: string;
  numeroEmpenho: string;
  valorHoraVoo: number;
  valorEstimado: number;
}

export interface FlightRecordBody {
  os: OSNormalized;
  rows: Array<{
    startTime: string;
    endTime: string;
    standby: boolean;
    ucs: string[];
  }>;
  common: {
    prefix: string;
    date: string;
    pilot: string;
  };
}

export interface OSReal {
  Contrato: string;
  Empresa: string;
  "Status do Contrato": string;
  "Unidade Solicitante": string;
  Formulário: string;
  "Ordem de Serviço": string;
  Base: string;
  "Horas Acionadas": string | number;
  Objetivo: string;
  Unidade: string;
  CNUC: string;
  Bioma: string;
  "Inicio da Operação": string | number;
  "Final da Operação": string | number;
  "Quant. Dias": number;
  "Quant. Aeronaves": number;
  "Tipo de Aeronave": string;
  "Modelo da Aeronave": string;
  "Prefixo Aeronaves.": string;
  "Fonte Orçamentária ": string;
  "Numero do Empenho": string;
  "Valor Hora/Voo": number;
  "Valor Estimado": number;
  "Total de Horas Voadas": string;
  "Horas Remanescentes": string;
  Status: string;
  tipo: "Rotativa" | "Fixa";
  Observacao: string;
}

export type OSPriority = 1 | 2 | 3;

export interface OSWithPriority extends OSNormalized {
  prioridade: OSPriority;
}
