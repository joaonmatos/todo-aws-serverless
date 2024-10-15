#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { DnsStack } from "./stacks/dns";
import { GlobalCertStack } from "./stacks/global-cert";
import { LocalCertStack } from "./stacks/local-cert";
import { EmailStack } from "./stacks/email";
import { CognitoStack } from "./stacks/cognito";
import { FrontendStack } from "./stacks/frontend";
import { CognitoDomainStack } from "./stacks/cognito-domain";

const app = new App();
const dns = new DnsStack(app);
const globalCert = new GlobalCertStack(app, { dns: dns.props });
new LocalCertStack(app, { dns: dns.props });
const email = new EmailStack(app, { dns: dns.props });
const cognito = new CognitoStack(app, {
  dns: dns.props,
  globalCert: globalCert.certificate,
});
cognito.addDependency(
  email,
  "CognitoStack is configured to use an email identity set up by EmailStack",
);
const frontend = new FrontendStack(app, {
  dns: dns.props,
  globalCert: globalCert.certificate,
  apiDomain: dns.props.subdomain("api"),
  cognito: cognito.props,
});
const cognitoDomain = new CognitoDomainStack(app, {
  dns: dns.props,
  globalCert: globalCert.certificate,
  cognito: cognito.props,
});
cognitoDomain.addDependency(
  frontend,
  "CognitoDomainStack is configured is on a subdomain that relies on an A record set in FrontendStack",
);
