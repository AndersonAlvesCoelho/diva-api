import axios from "axios";
import { ctrlExcelConfig, osExcelConfig } from "../config/azure";
import { getAppToken } from "./authService";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

async function graphClient() {
  const token = await getAppToken();
  return axios.create({
    baseURL: GRAPH_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

interface ExcelColumn {
  name: string;
}

export interface ExcelRow {
  index: number;
  values: unknown[][];
}

function rowsToObjects(
  columns: ExcelColumn[],
  rows: ExcelRow[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col.name] = row.values[0][i];
    });
    return obj;
  });
}

async function getTableData(
  driveId: string,
  itemId: string,
  tableName: string,
): Promise<Record<string, unknown>[]> {
  const client = await graphClient();
  const base = `/drives/${driveId}/items/${itemId}/workbook/tables/${tableName}`;

  const [colsRes, rowsRes] = await Promise.all([
    client.get<{ value: ExcelColumn[] }>(`${base}/columns`),
    client.get<{ value: ExcelRow[] }>(`${base}/rows`),
  ]);

  return rowsToObjects(colsRes.data.value, rowsRes.data.value);
}

async function addRow(
  driveId: string,
  itemId: string,
  tableName: string,
  values: unknown[],
): Promise<void> {
  const client = await graphClient();
  await client.post(
    `/drives/${driveId}/items/${itemId}/workbook/tables/${tableName}/rows/add`,
    { values: [values] },
  );
}

// ── OS — leitura do Excel de OS (CONTROLE DE AERONAVE DIVA)
export async function getOSRotativa(): Promise<Record<string, unknown>[]> {
  const rows = await getTableData(
    osExcelConfig.driveId,
    osExcelConfig.itemId,
    osExcelConfig.tables.acionamentoAR,
  );
  return rows
    .filter((r) => r["Status do Contrato"] === "Vigente")
    .map((r) => ({ ...r, tipo: "Rotativa" }));
}

export async function getOSFixa(): Promise<Record<string, unknown>[]> {
  const rows = await getTableData(
    osExcelConfig.driveId,
    osExcelConfig.itemId,
    osExcelConfig.tables.acionamentoAF,
  );
  return rows
    .filter((r) => r["Status do Contrato"] === "Vigente")
    .map((r) => ({ ...r, tipo: "Fixa" }));
}

export async function getFlightRecords(
  tipo: "Rotativa" | "Fixa",
  acionamento: string,
): Promise<Record<string, unknown>[]> {
  const tableName =
    tipo === "Rotativa"
      ? ctrlExcelConfig.tables.voosAR
      : ctrlExcelConfig.tables.voosAF;

  const rows = await getTableData(
    ctrlExcelConfig.driveId,
    ctrlExcelConfig.itemId,
    tableName,
  );
  return rows.filter((r) => r["Acionamento"] === acionamento);
}

export async function addFlightRecord(
  tipo: "Rotativa" | "Fixa",
  values: unknown[],
): Promise<void> {
  const tableName =
    tipo === "Rotativa"
      ? ctrlExcelConfig.tables.voosAR
      : ctrlExcelConfig.tables.voosAF;

  await addRow(
    ctrlExcelConfig.driveId,
    ctrlExcelConfig.itemId,
    tableName,
    values,
  );
}

//  UCs — leitura do Excel de OS (sheet "Lista CNUC e UCs")
export async function getUCs(): Promise<{ nome: string; codigo: string }[]> {
  const client = await graphClient();
  const sheetName = encodeURIComponent("Lista CNUC e UCs");
  const url = `/drives/${osExcelConfig.driveId}/items/${osExcelConfig.itemId}/workbook/worksheets/${sheetName}/usedRange`;

  const res = await client.get(url);
  const values: string[][] = res.data.values ?? [];

  if (values.length < 2) return [];

  const headers: string[] = values[0];
  const nomeIdx = headers.indexOf("Nome Padrão");
  const codigoIdx = headers.indexOf("Código");

  let naIndex = 0;

  return values
    .slice(1)
    .filter((row) => row[nomeIdx] || row[codigoIdx])
    .map((row) => {
      const nome = String(row[nomeIdx] ?? "").trim();
      const codigoRaw = String(row[codigoIdx] ?? "").trim();
      const isNA = !codigoRaw || codigoRaw.toLowerCase() === "n/a";

      const codigo = isNA ? `na_${naIndex++}` : codigoRaw;

      return { nome, codigo };
    });
}
