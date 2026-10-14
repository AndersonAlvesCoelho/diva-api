import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { listAllOS, listOSFixa, listOSRotativa } from "../services/osService";

export async function osRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["OS"],
        summary: "Lista todas as OS vigentes normalizadas (rotativa + fixa)",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: { type: "object", additionalProperties: true },
          },
        },
      },
    },
    async (_, reply) => reply.send(await listAllOS()),
  );

  fastify.get(
    "/rotativa",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["OS"],
        summary: "Lista OS de Asa Rotativa vigentes",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: { type: "object", additionalProperties: true },
          },
        },
      },
    },
    async (_, reply) => reply.send(await listOSRotativa()),
  );

  fastify.get(
    "/fixa",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["OS"],
        summary: "Lista OS de Asa Fixa vigentes",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: { type: "object", additionalProperties: true },
          },
        },
      },
    },
    async (_, reply) => reply.send(await listOSFixa()),
  );
}
