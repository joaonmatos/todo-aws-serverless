import {
  IPublicHostedZone,
  NsRecord,
  PublicHostedZone,
} from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { AppStack } from "../lib/app-stack";
import config from "../lib/config";
import { StackProps } from "aws-cdk-lib";

export type DnsStackExportedProps = Readonly<{
  domain: string;
  hostedZone: PublicHostedZone;
  subdomain: (qualifier: string) => string;
}>;

export class DnsStack extends AppStack {
  static readonly #QUALIFIER: string = "Dns";

  readonly props: DnsStackExportedProps;

  readonly domain: string;
  readonly hostedZone: PublicHostedZone;

  constructor(scope: Construct, props?: StackProps) {
    super(scope, DnsStack.#QUALIFIER, props);

    const parentHostedZone = this.#parentHostedZone();
    const {
      domain: { subdomain },
    } = config;

    this.domain = `${subdomain}.${parentHostedZone.zoneName}`;
    this.hostedZone = new PublicHostedZone(this, "HostedZone", {
      zoneName: this.domain,
    });

    new NsRecord(this, "DelegationRecord", {
      zone: parentHostedZone,
      recordName: subdomain,
      values: this.hostedZone.hostedZoneNameServers!,
    });

    this.props = {
      domain: this.domain,
      hostedZone: this.hostedZone,
      subdomain: this.subdomain.bind(this),
    };
  }

  subdomain(qualifier: string): string {
    if (qualifier.trim() === "") {
      return this.domain;
    }
    return `${qualifier}.${this.domain}`;
  }

  #parentHostedZone(): IPublicHostedZone {
    const {
      domain: { parent: domain },
    } = config;
    return PublicHostedZone.fromPublicHostedZoneAttributes(
      this,
      "ParentHostedZone",
      {
        zoneName: domain.name,
        hostedZoneId: domain.hostedZoneId,
      },
    );
  }
}
