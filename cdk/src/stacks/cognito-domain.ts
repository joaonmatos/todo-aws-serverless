import { StackProps } from "aws-cdk-lib";
import { DnsStackExportedProps } from "./dns";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { AppStack } from "../lib/app-stack";
import { Construct } from "constructs";
import { UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { CognitoStackExportProps } from "./cognito";
import { CnameRecord } from "aws-cdk-lib/aws-route53";

export interface CognitoDomainStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
  readonly globalCert: Certificate;
  readonly cognito: CognitoStackExportProps;
}

export class CognitoDomainStack extends AppStack {
  static readonly #QUALIFIER: string = "CognitoDomain";

  constructor(scope: Construct, props: CognitoDomainStackProps) {
    super(scope, CognitoDomainStack.#QUALIFIER, props);

    const domain = new UserPoolDomain(this, "UserPoolDomain", {
      userPool: props.cognito.userPool,
      customDomain: {
        certificate: props.globalCert,
        domainName: props.cognito.domain,
      },
    });

    new CnameRecord(this, "HostedUiCnameRecord", {
      domainName: domain.cloudFrontDomainName,
      zone: props.dns.hostedZone,
      recordName: props.cognito.domain + ".",
    });
  }
}
