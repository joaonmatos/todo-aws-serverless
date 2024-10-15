import { resolve } from "node:path";
import { packageDir } from "./package-dir";

export const appFrontend = resolve(packageDir, "../app-frontend/dist");

export const s3FileLambda = resolve(
  packageDir,
  "../s3-file-handler/build/libs/s3-file-handler-1.0-SNAPSHOT-all.jar",
);

export const apiLambda = resolve(
  packageDir,
  "../api/build/libs/api-1.0-SNAPSHOT-all.jar",
);
