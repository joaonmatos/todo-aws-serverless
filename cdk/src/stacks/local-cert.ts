import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { AppStack } from "../lib/app-stack";
import type { DnsStackExportedProps } from "./dns";
import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";

export interface LocalCertStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
}

export class LocalCertStack extends AppStack {
  static readonly #QUALIFIER: string = "LocalCert";

  readonly certificate: Certificate;

  constructor(scope: Construct, props: LocalCertStackProps) {
    super(scope, LocalCertStack.#QUALIFIER, props);

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
