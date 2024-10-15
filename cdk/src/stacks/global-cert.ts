import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { AppStack } from "../lib/app-stack";
import type { DnsStackExportedProps } from "./dns";
import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";

export interface GlobalCertStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
}

export class GlobalCertStack extends AppStack {
  static readonly #QUALIFIER: string = "GlobalCert";
  static readonly #REGION: string = "us-east-1";

  readonly certificate: Certificate;

  constructor(scope: Construct, props: GlobalCertStackProps) {
    super(scope, GlobalCertStack.#QUALIFIER, {
      env: { region: GlobalCertStack.#REGION },
      ...props,
    });

    const {
      dns: { subdomain, domain, hostedZone },
    } = props;

    this.certificate = new Certificate(this, "Certificate", {
      domainName: subdomain("*"),
      subjectAlternativeNames: [domain],
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
