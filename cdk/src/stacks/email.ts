import { StackProps } from "aws-cdk-lib";
import { DnsStackExportedProps } from "./dns";
import { AppStack } from "../lib/app-stack";
import { EmailIdentity, Identity } from "aws-cdk-lib/aws-ses";
import { Construct } from "constructs";

export interface EmailStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
}

export type EmailStackExportedProps = Readonly<{
  domain: string;
  identity: EmailIdentity;
}>;

export class EmailStack extends AppStack {
  static readonly #QUALIFIER: string = "Email";

  readonly domain: string;
  readonly identity: EmailIdentity;

  readonly props: EmailStackExportedProps;

  constructor(scope: Construct, props: EmailStackProps) {
    super(scope, EmailStack.#QUALIFIER, props);

    const {
      dns: { domain, hostedZone },
    } = props;

    this.domain = domain;
    this.identity = new EmailIdentity(this, "Identity", {
      identity: Identity.publicHostedZone(hostedZone),
    });

    this.props = {
      domain,
      identity: this.identity,
    };
  }
}
