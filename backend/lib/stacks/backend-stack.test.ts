import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BackendStack } from './backend-stack';

describe('BackendStack', () => {
  it.each(['dev', 'staging', 'prod'] as const)('synthesizes without errors for %s environment', (environment) => {
    const app = new cdk.App();
    const stack = new BackendStack(app, `Test-${environment}`, { environment });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toBeDefined();
  });

  it('synthesized template contains zero user-defined resources', () => {
    const app = new cdk.App();
    const stack = new BackendStack(app, 'Test-dev', { environment: 'dev' });
    const template = Template.fromStack(stack);
    expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
  });

  it.each(['dev', 'staging', 'prod'] as const)('includes required tags for %s environment', (environment) => {
    const app = new cdk.App();
    const stack = new BackendStack(app, `Test-${environment}`, { environment });
    const tags = cdk.Tags.of(stack);
    // Verify tags by synthesizing and checking the manifest
    const assembly = app.synth();
    const stackArtifact = assembly.getStackByName(`Test-${environment}`);
    expect(stackArtifact.tags).toMatchObject({
      Stack: `Test-${environment}`,
    });
  });

  it('throws error for invalid environment', () => {
    const app = new cdk.App();
    expect(() => new BackendStack(app, 'Test-invalid', { environment: 'invalid' as any }))
      .toThrow('Invalid environment "invalid"');
  });
});
