import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { validateEnvironment } from '../lib/config';

describe('CDK App Entry Point', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CDK_DEFAULT_REGION;
    delete process.env.CDK_DEFAULT_ACCOUNT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createApp(context: Record<string, string> = {}) {
    const app = new cdk.App({ context });
    const environment = (app.node.tryGetContext('environment') ?? 'dev') as string;
    validateEnvironment(environment);
    const region = process.env.CDK_DEFAULT_REGION || 'eu-west-2';
    const account = process.env.CDK_DEFAULT_ACCOUNT || undefined;
    new AuthStack(app, `OTJobber-Auth-${environment}`, {
      env: { region, account },
      environment,
    });
    cdk.Tags.of(app).add('Application', 'OTJobber');
    cdk.Tags.of(app).add('Environment', environment);
    cdk.Tags.of(app).add('ManagedBy', 'CDK');
    return app;
  }

  it('creates stack with correct naming pattern OTJobber-Auth-{environment}', () => {
    const app = createApp({ environment: 'staging' });
    const assembly = app.synth();
    expect(assembly.getStackByName('OTJobber-Auth-staging')).toBeDefined();
  });

  it('defaults to dev environment when context not provided', () => {
    const app = createApp();
    const assembly = app.synth();
    expect(assembly.getStackByName('OTJobber-Auth-dev')).toBeDefined();
  });

  it('defaults to eu-west-2 when CDK_DEFAULT_REGION not set', () => {
    const app = createApp();
    const assembly = app.synth();
    const stack = assembly.getStackByName('OTJobber-Auth-dev');
    expect(stack.environment.region).toBe('eu-west-2');
  });

  it('throws error for invalid environment context value', () => {
    expect(() => createApp({ environment: 'invalid' })).toThrow('Invalid environment "invalid"');
  });
});
