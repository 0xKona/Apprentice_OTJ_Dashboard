import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/stacks/backend-stack';
import { AuthStack } from '../lib/stacks/auth-stack';

const app = new cdk.App();

const environment = (app.node.tryGetContext('environment') ?? 'dev') as string;
const validEnvironments = ['dev', 'staging', 'prod'];
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment "${environment}". Must be one of: ${validEnvironments.join(', ')}`);
}

const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-2';
const account = process.env.CDK_DEFAULT_ACCOUNT ?? undefined;

new BackendStack(app, `OTJobber-Backend-${environment}`, {
  env: { region, account },
  environment: environment as 'dev' | 'staging' | 'prod',
});

new AuthStack(app, `OTJobber-Auth-${environment}`, {
  env: { region, account },
  environment: environment as 'dev' | 'staging' | 'prod',
});

cdk.Tags.of(app).add('Application', 'OTJobber');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');

app.synth();
