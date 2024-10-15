import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import config from "./config";
import { merge } from "ts-deepmerge";
const { name, env } = config;

export abstract class AppStack extends Stack {
  constructor(scope: Construct, qualifier: string, props?: StackProps) {
    super(scope, `${name}-${qualifier}`, {
      ...props,
      env: merge(env, props?.env ?? {}),
      crossRegionReferences: props?.crossRegionReferences ?? true,
    });
  }
}
