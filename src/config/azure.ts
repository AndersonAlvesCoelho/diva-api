import "dotenv/config";

export const azureConfig = {
  clientId: process.env.AZURE_CLIENT_ID!,
  tenantId: process.env.AZURE_TENANT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
};

// Excel - Hora de voos
// Leitura e escrita de registros — tbControleVoosAR, tbControleVoosA
export const ctrlExcelConfig = {
  driveId: process.env.SP_DRIVE_ID_CTRL!,
  itemId: process.env.SP_ITEM_ID_CTRL!,
  tables: {
    voosAR: "tbControleVoosAR",
    voosAF: "tbControleVoosAF",
  },
};

// Excel 2 — OS
// Leitura dos acionamentos/OS — tbAcionamentoVoosAR e tbAcionamentoVoosAFF, tbUC
export const osExcelConfig = {
  driveId: process.env.SP_DRIVE_ID_OS!,
  itemId: process.env.SP_ITEM_ID_OS!,
  tables: {
    acionamentoAR: "Tabela7",
    acionamentoAF: "Tabela12",
    ucs: "tbCNUC",
  },
};
