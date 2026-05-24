import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DataStack } from '../lib/stacks/data-stack';
import { AiStack } from '../lib/stacks/ai-stack';
import { HostingStack } from '../lib/stacks/hosting-stack';
import { validateEnvironment } from '../lib/config';

const app = new cdk.App();

const environment = (app.node.tryGetContext('environment') ?? 'dev') as string;
validateEnvironment(environment);

const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-2';
const account = process.env.CDK_DEFAULT_ACCOUNT ?? undefined;
const env = { region, account };

const authStack = new AuthStack(app, `OTJobber-Auth-${environment}`, {
  env,
  environment,
});

const dataStack = new DataStack(app, `OTJobber-Data-${environment}`, {
  env,
  environment,
  userPool: authStack.userPool,
});

new AiStack(app, `OTJobber-Ai-${environment}`, {
  env,
  environment,
  api: dataStack.api,
  dataTable: dataStack.dataTable,
});

new HostingStack(app, `OTJobber-Hosting-${environment}`, {
  env,
  environment,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
  apiUrl: dataStack.api.graphqlUrl,
});

cdk.Tags.of(app).add('Application', 'OTJobber');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');

app.synth();
