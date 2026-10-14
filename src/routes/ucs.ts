import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { getUCs } from "../services/graphService";

export async function ucsRoutes(fastify: FastifyInstance) {
  // GET /ucs
  fastify.get(
    "/",
    {
      preHandler: authMiddleware,
      schema: {
        tags: ["UCs"],
        summary: "Lista todas as Unidades de Conservação",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                value: { type: "string" },
                label: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const rows = await getUCs();
      return reply.send(
        rows
          .filter((r) => r.nome || r.codigo)
          .map((r) => ({
            value: r.codigo,
            label: r.nome,
          })),
      );
    },
  );
}
