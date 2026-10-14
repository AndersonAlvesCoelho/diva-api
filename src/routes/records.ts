import { FastifyInstance } from "fastify";
import { AuthenticatedUser, authMiddleware } from "../middlewares/auth";
import { addFlightRecord, getFlightRecords } from "../services/graphService";
import { FlightRecordBody } from "../types/os";
import { calcFlightTime, normalizeCnuc } from "../utils/help";

export async function recordsRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { tipo: string; acionamento: string } }>(
    "/:tipo/:acionamento",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["Registros de Voo"],
        summary: "Busca registros de voo de uma OS",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: ["Rotativa", "Fixa"] },
            acionamento: { type: "string" },
          },
          required: ["tipo", "acionamento"],
        },
      },
    },
    async (request, reply) => {
      const { tipo, acionamento } = request.params;
      return reply.send(
        await getFlightRecords(
          tipo as "Rotativa" | "Fixa",
          decodeURIComponent(acionamento),
        ),
      );
    },
  );

  fastify.post<{ Body: FlightRecordBody }>(
    "/",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["Registros de Voo"],
        summary: "Adiciona registros de voo",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["os", "rows", "common"],
          properties: {
            os: { type: "object", additionalProperties: true },
            rows: { type: "array", items: { type: "object" } },
            common: { type: "object" },
          },
        },
      },
    },
    async (request, reply) => {
      const { os, rows, common } = request.body;
      const user = (request as any).user as AuthenticatedUser;
      const validRows = rows.filter(
        (r: any) => r.standby || (r.startTime && r.endTime),
      );

      const records = validRows.map((r: any) => {
        const { hhmm, decimal } = r.standby
          ? { hhmm: "01:00", decimal: "1,00" }
          : calcFlightTime(r.startTime, r.endTime);

        // nomes das UCs (vem do frontend), ucs = códigos CNUC
        const unidade =
          Array.isArray(r.ucsNames) && r.ucsNames.length > 0
            ? r.ucsNames.join("; ")
            : Array.isArray(r.ucs)
              ? r.ucs.join("; ")
              : "";

        const cnuc = Array.isArray(r.ucs) ? normalizeCnuc(r.ucs) : "";

        return {
          Contrato: os.contrato,
          Empresa: os.empresa,
          "Unidade Solicitante": os.unidadeSolicitante,
          Acionamento: os.ordemDeServico,
          Base: os.base,
          "Status do Contrato": os.statusContrato,
          "Data do Voo": common.date,
          Partida: r.standby ? "" : r.startTime,
          Corte: r.standby ? "" : r.endTime,
          "Tempo de Voo": hhmm,
          Decimais: decimal,
          Plantão: r.standby ? "1" : "0",
          Objetivo: os.objetivo,
          Bioma: os.bioma,
          Unidade: unidade,
          CNUC: cnuc,
          "Modelo - Aeronave": os.modeloAeronave,
          Prefixo: common.prefix,
          AGENTE: user.email,
          Piloto: common.pilot ?? "",
          "Nota Fiscal": "",
          TRP: "",
          "Relatorio de Voo": "",
          Observacao: r.observation ?? "",
        };
      });

      for (const record of records) {
        const values =
          os.tipo === "Rotativa"
            ? [
                record.Contrato,
                record.Empresa,
                record["Unidade Solicitante"],
                record.Acionamento,
                record.Base,
                record["Status do Contrato"],
                record["Data do Voo"],
                record.Partida,
                record.Corte,
                record["Tempo de Voo"],
                record.Decimais,
                record.Plantão,
                record.Objetivo,
                record.Bioma,
                record.Unidade,
                record.CNUC,
                record["Modelo - Aeronave"],
                record.Prefixo,
                record.AGENTE,
                record["Nota Fiscal"],
                record.TRP,
                record["Relatorio de Voo"],
                record.Piloto,
                record.Observacao,
              ]
            : [
                record.Contrato,
                record.Empresa,
                record["Unidade Solicitante"],
                record.Acionamento,
                record.Base,
                record["Status do Contrato"],
                record["Data do Voo"],
                record.Partida,
                record.Corte,
                record["Tempo de Voo"],
                record.Decimais,
                record.Plantão,
                record.Objetivo,
                record.Bioma,
                record.Unidade,
                record.CNUC,
                record["Modelo - Aeronave"],
                record.Prefixo,
                record.AGENTE,
                record["Nota Fiscal"],
                record.TRP,
                record["Relatorio de Voo"],
                record.Piloto,
                record.Observacao,
              ];

        await addFlightRecord(os.tipo as "Rotativa" | "Fixa", values);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      return reply.status(201).send({
        success: true,
        count: records.length,
        records,
      });
    },
  );
}
