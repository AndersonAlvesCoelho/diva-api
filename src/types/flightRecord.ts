export interface FlightRecord {
  Contrato: string;
  Empresa: string;
  "Unidade Solicitante": string;
  Acionamento: string;
  Base: string;
  "Status do Contrato": string;
  "Data do Voo": string;
  Partida: string;
  Corte: string;
  "Tempo de Voo": string;
  Decimais: string | number;
  Plantão: string | number;
  Objetivo: string;
  Bioma: string;
  Unidade: string;
  CNUC: string;
  "Modelo - Aeronave": string;
  "Prefixo Aeronave": string;
  Agente: string;
  "Nota Fiscal": string;
  TRP: string;
  "Relatorio de Voo": string;
}

export interface CreateFlightRecordInput {
  os: {
    Contrato: string;
    Empresa: string;
    "Unidade Solicitante": string;
    "Ordem de Serviço": string;
    Base: string;
    "Status do Contrato": string;
    Objetivo: string;
    Bioma: string;
    "Modelo da Aeronave": string;
    tipo: "Rotativa" | "Fixa";
  };
  rows: FlightRowInput[];
  common: {
    prefix: string;
    date: string;
    pilot: string;
  };
  userEmail: string;
}

export interface FlightRowInput {
  startTime: string;
  endTime: string;
  standby: boolean;
  ucs: string[];
}
