import { chdir } from "node:process";
import { parseEnv, port, z } from "znv";
import { config as loadConfig } from "dotenv";
import { packageDir } from "./package-dir";

chdir(packageDir);
loadConfig();

export type ApplicationConfig = {
  name: string;
  env: {
    account: string;
    region: string;
  };
  domain: {
    parent: {
      name: string;
      hostedZoneId: string;
    };
    subdomain: string;
  };
  local: {
    frontend: {
      port: string;
    };
    admin: {
      port: string;
    };
  };
};

const envSchemaInner = {
  TODO_APP_NAME: z.string(),
  TODO_AWS_ACCOUNT: z.string(),
  TODO_AWS_REGION: z.string(),
  TODO_PARENT_DOMAIN: z.string(),
  TODO_PARENT_HOSTED_ZONE_ID: z.string(),
  TODO_SUBDOMAIN: z.string(),
  TODO_LOCAL_FRONTEND_PORT: port()
    .optional()
    .default(6543)
    .transform((p) => `${p}`),
  TODO_LOCAL_ADMIN_PORT: port()
    .optional()
    .default(6545)
    .transform((p) => `${p}`),
};
const envSchema = z.object(envSchemaInner);

function structureConfig(config: z.infer<typeof envSchema>): ApplicationConfig {
  return {
    name: config.TODO_APP_NAME,
    env: {
      account: config.TODO_AWS_ACCOUNT,
      region: config.TODO_AWS_REGION,
    },
    domain: {
      parent: {
        name: config.TODO_PARENT_DOMAIN,
        hostedZoneId: config.TODO_PARENT_HOSTED_ZONE_ID,
      },
      subdomain: config.TODO_SUBDOMAIN,
    },
    local: {
      frontend: {
        port: config.TODO_LOCAL_FRONTEND_PORT,
      },
      admin: {
        port: config.TODO_LOCAL_ADMIN_PORT,
      },
    },
  };
}

const envConfig = parseEnv(process.env, envSchemaInner);

export const config = structureConfig(envConfig);

export default config;
