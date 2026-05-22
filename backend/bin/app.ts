import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { validateEnvironment } from '../lib/config';

const app = new cdk.App();

const environment = (app.node.tryGetContext('environment') ?? 'dev') as string;
validateEnvironment(environment);

const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-2';
const account = process.env.CDK_DEFAULT_ACCOUNT ?? undefined;

new AuthStack(app, `OTJobber-Auth-${environment}`, {
  env: { region, account },
  environment,
});

cdk.Tags.of(app).add('Application', 'OTJobber');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');

app.synth();

