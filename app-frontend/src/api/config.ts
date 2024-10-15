import { z } from "zod";

const appDomain = window.location.origin;
const configUrl = new URL("/config.json", appDomain);

const configSchema = z.object({
  name: z.string(),
  baseUrls: z.object({
    api: z.string(),
    auth: z.string(),
  }),
  authClientId: z.string(),
  authScopes: z.array(z.string()),
});

export type Config = {
  readonly name: string;
  readonly baseUrls: {
    readonly api: string;
    readonly auth: string;
  };
  readonly authClientId: string;
  readonly authScopes: string[];
};

export async function getConfig(): Promise<Config> {
  const res = await fetch(configUrl);
  const body = await res.json();
  return configSchema.parse(body);
}
