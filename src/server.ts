import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import "dotenv/config";
import Fastify from "fastify";

import { osRoutes } from "./routes/os";
import { recordsRoutes } from "./routes/records";
import { ucsRoutes } from "./routes/ucs";

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "AeroHoras API",
        description: "API de controle de horas de voo — DIVA / ICMBio",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list" },
  });

  // Rotas
  await fastify.register(osRoutes, { prefix: "/os" });
  await fastify.register(recordsRoutes, { prefix: "/records" });
  await fastify.register(ucsRoutes, { prefix: "/ucs" });

  // Health check
  fastify.get("/health", { schema: { tags: ["Health"] } }, async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // Start
  const port = Number(process.env.PORT ?? 3000);
  await fastify.listen({ port, host: "0.0.0.0" });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
