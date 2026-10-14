import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { azureConfig } from "../config/azure";

// JWKS client — busca chaves públicas do Entra ID
const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${azureConfig.tenantId}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 86400000, // 24h
});

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwks.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

// Middleware de autenticação
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decodifica o header para obter o kid (key id)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") {
      return reply.status(401).send({ error: "Token inválido" });
    }

    const kid = decoded.header.kid;
    if (!kid) {
      return reply.status(401).send({ error: "Token sem kid" });
    }

    // Busca a chave pública e verifica o token
    const publicKey = await getSigningKey(kid);

    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      // audience: [azureConfig.clientId, "https://graph.microsoft.com"],
      issuer: [
        `https://login.microsoftonline.com/${azureConfig.tenantId}/v2.0`,
        `https://sts.windows.net/${azureConfig.tenantId}/`, // ← v1 endpoint
      ],
    }) as jwt.JwtPayload;

    // Injeta dados do usuário na requisição
    (request as any).user = {
      id: payload.oid,
      email: payload.preferred_username ?? payload.upn ?? "",
      name: payload.name ?? "",
    };
  } catch (err) {
    return reply.status(401).send({ error: "Token inválido ou expirado" });
  }
}

// Tipo auxiliar para acessar request.user nas rotas
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}
