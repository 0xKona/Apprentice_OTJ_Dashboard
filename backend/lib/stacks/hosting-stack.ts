import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Environment, validateEnvironment } from '../config';

export interface HostingStackProps extends cdk.StackProps {
  environment: Environment;
  userPoolId: string;
  userPoolClientId: string;
  apiUrl: string;
}

export class HostingStack extends cdk.Stack {
  public readonly app: amplify.CfnApp;

  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id, props);
    validateEnvironment(props.environment);
    cdk.Tags.of(this).add('Stack', id);

    const serviceRole = new iam.Role(this, 'AmplifyServiceRole', {
      roleName: `OTJobber-AmplifyRole-${props.environment}`,
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
      ],
    });

    const buildSpec = `version: 1
applications:
  - appRoot: frontend
    frontend:
      framework: next
      phases:
        preBuild:
          commands:
            - npm install --prefix ..
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - ../node_modules/**/*
          - .next/cache/**/*`;

    this.app = new amplify.CfnApp(this, 'AmplifyApp', {
      name: `OTJobber-${props.environment}`,
      platform: 'WEB_COMPUTE',
      iamServiceRole: serviceRole.roleArn,
      environmentVariables: [
        { name: 'AMPLIFY_DIFF_DEPLOY', value: 'false' },
        { name: 'AMPLIFY_MONOREPO_APP_ROOT', value: 'frontend' },
        { name: 'NEXT_PUBLIC_AWS_REGION', value: 'eu-west-2' },
        { name: 'NEXT_PUBLIC_USER_POOL_ID', value: props.userPoolId },
        { name: 'NEXT_PUBLIC_USER_POOL_CLIENT_ID', value: props.userPoolClientId },
        { name: 'NEXT_PUBLIC_API_URL', value: props.apiUrl },
      ],
      customRules: [],
      buildSpec,
    });

    new cdk.CfnOutput(this, 'AmplifyAppId', { value: this.app.attrAppId });
    new cdk.CfnOutput(this, 'AmplifyDefaultDomain', { value: this.app.attrDefaultDomain });
    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://eu-west-2.console.aws.amazon.com/amplify/home?region=eu-west-2#/${this.app.attrAppId}`,
      description: 'Open this URL to connect your GitHub repository',
    });
  }
}
