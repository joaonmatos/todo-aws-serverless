import { StackProps } from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import { Construct } from "constructs";
import { DnsStackExportedProps } from "./dns";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  HttpVersion,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AaaaRecord, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { CognitoStackExportProps } from "./cognito";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { appFrontend } from "../lib/assets";
import config from "../lib/config";
import { S3File } from "../lib/s3-file";

export interface FrontendStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
  readonly globalCert: Certificate;
  readonly cognito: CognitoStackExportProps;
  readonly apiDomain: string;
}

export class FrontendStack extends AppStack {
  static readonly #QUALIFIER: string = "Frontend";

  constructor(scope: Construct, props: FrontendStackProps) {
    super(scope, FrontendStack.#QUALIFIER, props);

    const loggingBucket = new Bucket(this, "AccessLoggingBucket", {
      enforceSSL: true,
      minimumTLSVersion: 1.2,
    });

    const assetBucket = new Bucket(this, "AssetBucket", {
      enforceSSL: true,
      minimumTLSVersion: 1.2,
      serverAccessLogsBucket: loggingBucket,
    });

    const domainName = props.dns.subdomain("");

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(assetBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate: props.globalCert,
      defaultRootObject: "index.html",
      domainNames: [domainName],
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      httpVersion: HttpVersion.HTTP2_AND_3,
    });

    new ARecord(this, "AliasRecordV4", {
      zone: props.dns.hostedZone,
      recordName: domainName + ".",
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    new AaaaRecord(this, "AliasRecordV6", {
      zone: props.dns.hostedZone,
      recordName: domainName + ".",
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    const assetDeployment = new BucketDeployment(this, "AssetDeployment", {
      destinationBucket: assetBucket,
      sources: [Source.asset(appFrontend)],
      distribution,
    });

    const appName = config.name;
    const apiBase = `https://${props.apiDomain}`;
    const authBase = `https://${props.cognito.domain}`;
    const clientId = props.cognito.client.userPoolClientId;
    const scopes = props.cognito.scopes.map((scope) => scope.scopeName);

    const appConfig = {
      name: appName,
      baseUrls: {
        api: apiBase,
        auth: authBase,
      },
      authClientId: clientId,
      authScopes: scopes,
    };

    const configDeployment = new S3File(this, "AppConfigDeployment", {
      bucket: assetBucket,
      objectKey: "config.json",
      contents: appConfig,
    });

    // deploy config after assets and clean up config before assets
    configDeployment.node.addDependency(assetDeployment);
  }
}
