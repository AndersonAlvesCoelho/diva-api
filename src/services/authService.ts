import { ConfidentialClientApplication } from "@azure/msal-node";
import { azureConfig } from "../config/azure";

let msalClient: ConfidentialClientApplication | null = null;

function getMsalClient(): ConfidentialClientApplication {
  if (!msalClient) {
    msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: azureConfig.clientId,
        authority: azureConfig.authority,
        clientSecret: azureConfig.clientSecret,
      },
    });
  }
  return msalClient;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAppToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const result = await getMsalClient().acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  if (!result?.accessToken) {
    throw new Error("Falha ao obter token de aplicação");
  }

  cachedToken = result.accessToken;
  tokenExpiry = result.expiresOn?.getTime() ?? now + 3600_000;

  return cachedToken;
}
