import { Duration, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStack } from "../lib/app-stack";
import { DnsStackExportedProps } from "./dns";
import { Code, Function as Lambda, Runtime } from "aws-cdk-lib/aws-lambda";
import { apiLambda } from "../lib/assets";
import { Key } from "aws-cdk-lib/aws-kms";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  CorsHttpMethod,
  DomainName,
  HttpApi,
} from "aws-cdk-lib/aws-apigatewayv2";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import config from "../lib/config";

export interface ApiStackProps extends StackProps {
  dns: DnsStackExportedProps;
  regionalCert: Certificate;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
}

export class ApiStack extends AppStack {
  static #QUALIFIER: string = "Api";
  constructor(scope: Construct, props: ApiStackProps) {
    super(scope, ApiStack.#QUALIFIER, props);

    const todosTable = new TableV2(this, "TodosTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      globalSecondaryIndexes: [
        {
          indexName: "ownerIdIndex",
          partitionKey: {
            name: "ownerId",
            type: AttributeType.STRING,
          },
          sortKey: {
            name: "createdAt",
            type: AttributeType.STRING,
          },
        },
      ],
    });

    const key = new Key(this, "NextTokenKey");

    const handler = new Lambda(this, "HandlerFunction", {
      code: Code.fromAsset(apiLambda),
      handler: "com.joaonmatos.serverless.todo.HandlerMain::handleRequest",
      runtime: Runtime.JAVA_21,
      environment: {
        TODO_TABLE_NAME: todosTable.tableName,
        KMS_KEY_ID: key.keyId,
      },
      timeout: Duration.seconds(30),
      memorySize: 256,
    });

    todosTable.grantReadWriteData(handler);
    key.grantEncryptDecrypt(handler);

    const integration = new HttpLambdaIntegration(
      "HandlerIntegration",
      handler,
    );

    const domainName = new DomainName(this, "ApiDomainName", {
      domainName: props.dns.subdomain("api"),
      certificate: props.regionalCert,
    });

    const authorizer = new HttpUserPoolAuthorizer(
      "ApiUserPoolAuthorizer",
      props.userPool,
      { userPoolClients: [props.userPoolClient] },
    );

    new HttpApi(this, "ApiGW", {
      defaultDomainMapping: {
        domainName,
      },
      defaultIntegration: integration,
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: [
          `https://${props.dns.domain}`,
          `http://localhost:${config.local.frontend.port}`,
        ],
        maxAge: Duration.days(1),
      },
    });

    new ARecord(this, "ApiARecord", {
      zone: props.dns.hostedZone,
      recordName: "api",
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });
  }
}
