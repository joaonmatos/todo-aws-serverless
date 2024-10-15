import { Code, Function as Lambda, Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { s3FileLambda } from "./assets";
import { CustomResource, Duration, Stack } from "aws-cdk-lib";
import hash from "./sha256";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Provider } from "aws-cdk-lib/custom-resources";
import { IDistribution } from "aws-cdk-lib/aws-cloudfront";

export type S3FileProps = {
  readonly bucket: IBucket;
  readonly objectKey: string;
  readonly contents: unknown;
  readonly distribution?: IDistribution;
};

export class S3File extends Construct {
  constructor(scope: Construct, id: string, props: S3FileProps) {
    super(scope, id);

    const { bucket, objectKey, contents, distribution } = props;
    const json = JSON.stringify(contents, null, 2);
    const sha256Hash = hash(json);

    const parameter = new StringParameter(this, "S3File-Parameter", {
      stringValue: json,
    });

    const provider = S3Provider.getOrCreate(this);
    provider.authorizeParam(parameter);
    provider.authorizeBucket(bucket, objectKey);
    if (distribution) {
      provider.authorizeDistribution(distribution);
    }

    new CustomResource(this, "S3File-CustomResource", {
      serviceToken: provider.serviceToken(),
      resourceType: "Custom::S3File",
      properties: {
        bucketName: bucket.bucketName,
        objectKey,
        configParameterName: parameter.parameterName,
        configValueSha256Hash: sha256Hash,
        distributionId: distribution?.distributionId,
      },
    });
  }
}

class S3Provider extends Construct {
  readonly #lambda: Lambda;
  readonly #provider: Provider;

  public static getOrCreate(scope: Construct) {
    const stack = Stack.of(scope);
    const id = "com.joaonmatos.serverless.todo.s3file-provider";
    const provider =
      (stack.node.tryFindChild(id) as S3Provider | undefined) ??
      new S3Provider(stack, id);
    return provider;
  }

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.#lambda = new Lambda(this, "S3File-OnEventHandler", {
      code: Code.fromAsset(s3FileLambda),
      runtime: Runtime.JAVA_21,
      handler: "com.joaonmatos.serverless.todo.S3FileHandler::handleRequest",
      timeout: Duration.seconds(30),
      memorySize: 256,
    });

    this.#provider = new Provider(this, "S3File-Provider", {
      onEventHandler: this.#lambda,
    });
  }

  serviceToken(): string {
    return this.#provider.serviceToken;
  }

  authorizeParam(parameter: StringParameter) {
    parameter.grantRead(this.#lambda);
  }

  authorizeBucket(bucket: IBucket, objectKey: string) {
    bucket.grantReadWrite(this.#lambda, objectKey);
  }

  authorizeDistribution(distribution: IDistribution) {
    distribution.grantCreateInvalidation(this.#lambda);
  }
}
