import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStack } from "../lib/app-stack";
import {
  AccountRecovery,
  AdvancedSecurityMode,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolEmail,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { DnsStackExportedProps } from "./dns";
import appConfig from "../lib/config";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

const invitationSubject = `${appConfig.name}: you've been invited!`;
const invitationBody = `<p><strong>
You've been invited to join the app ${appConfig.name}!
</strong><p>
<p>Use the following credentials to login:</p>
<ul>
<li>Username: <em>{username}</em></li>
<li>Password: <em>{####}</em></li>
`;

const verificationSubject = `${appConfig.name}: verify your email`;
const verificationBody = `<p>Dear {username},</p>
<p>Welcome to the app ${appConfig.name}!</p>
<p>{##Click here to verify your email##}.</p>
`;

export interface CognitoStackProps extends StackProps {
  readonly dns: DnsStackExportedProps;
  readonly globalCert: Certificate;
}

export type CognitoStackExportProps = Readonly<{
  userPool: UserPool;
  client: UserPoolClient;
  scopes: OAuthScope[];
  domain: string;
}>;

export class CognitoStack extends AppStack {
  static readonly #QUALIFIER: string = "Cognito";

  readonly userPool: UserPool;
  readonly client: UserPoolClient;
  readonly scopes: OAuthScope[];
  readonly domain: string;

  readonly props: CognitoStackExportProps;

  constructor(scope: Construct, props: CognitoStackProps) {
    super(scope, CognitoStack.#QUALIFIER, props);

    const {
      dns: { domain, subdomain },
    } = props;

    this.userPool = new UserPool(this, "UserPool", {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      advancedSecurityMode: AdvancedSecurityMode.ENFORCED,
      autoVerify: {
        email: true,
      },
      deviceTracking: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true,
      },
      email: UserPoolEmail.withSES({
        fromEmail: `no-reply@${domain}`,
        fromName: appConfig.name,
        sesVerifiedDomain: domain,
      }),
      keepOriginal: {
        email: true,
      },
      mfa: Mfa.REQUIRED,
      mfaSecondFactor: {
        otp: true,
        sms: false,
      },
      passwordPolicy: {
        minLength: 16,
        requireDigits: false,
        requireLowercase: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: false,
        preferredUsername: false,
        username: false,
      },
      signInCaseSensitive: false,
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        preferredUsername: {
          mutable: true,
          required: true,
        },
      },
      userInvitation: {
        emailSubject: invitationSubject,
        emailBody: invitationBody,
      },
      userVerification: {
        emailStyle: VerificationEmailStyle.LINK,
        emailSubject: verificationSubject,
        emailBody: verificationBody,
      },
    });

    this.domain = subdomain("auth");
    this.scopes = [OAuthScope.EMAIL, OAuthScope.OPENID];

    const localAppConfig = buildConfig(
      `http://localhost:${appConfig.local.frontend.port}`,
    );
    const prodAppConfig = buildConfig(`https://${domain}`);
    this.client = new UserPoolClient(this, "AppClient", {
      userPool: this.userPool,
      oAuth: {
        callbackUrls: [localAppConfig.redirectUrl, prodAppConfig.redirectUrl],
        defaultRedirectUri: prodAppConfig.redirectUrl,
        logoutUrls: [localAppConfig.logoutUrl, prodAppConfig.logoutUrl],
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: this.scopes,
      },
      preventUserExistenceErrors: true,
    });

    this.props = {
      userPool: this.userPool,
      client: this.client,
      domain: this.domain,
      scopes: this.scopes,
    };
  }
}

type AuthConfig = {
  redirectUrl: string;
  logoutUrl: string;
};

function buildConfig(baseUrl: string): AuthConfig {
  return {
    redirectUrl: `${baseUrl}/auth/redirect`,
    logoutUrl: `${baseUrl}/`,
  };
}
