import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AuthStack } from './auth-stack';

describe('AuthStack', () => {
  it.each(['dev', 'staging', 'prod'] as const)('synthesizes without errors for %s', (environment) => {
    const app = new cdk.App();
    const stack = new AuthStack(app, `Test-${environment}`, { environment });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toBeDefined();
  });

  it('throws error for invalid environment', () => {
    const app = new cdk.App();
    expect(() => new AuthStack(app, 'Test', { environment: 'invalid' as any }))
      .toThrow('Invalid environment "invalid"');
  });

  it('User Pool has correct password policy', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'Test', { environment: 'dev' });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: true,
        },
      },
    });
  });

  it('User Pool has email sign-in configured', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'Test', { environment: 'dev' });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UsernameAttributes: ['email'],
      AutoVerifiedAttributes: ['email'],
    });
  });

  it('User Pool has MFA off', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'Test', { environment: 'dev' });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      MfaConfiguration: 'OFF',
    });
  });

  it('App Client has correct auth flows and no secret', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'Test', { environment: 'dev' });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      ExplicitAuthFlows: Match.arrayWith([
        'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_USER_SRP_AUTH',
      ]),
      GenerateSecret: false,
    });
  });

  it('has CloudFormation outputs for UserPoolId and UserPoolClientId', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'Test', { environment: 'dev' });
    const template = Template.fromStack(stack);
    const outputs = template.toJSON().Outputs;
    expect(outputs).toHaveProperty('UserPoolId');
    expect(outputs).toHaveProperty('UserPoolClientId');
  });

  it('applies Stack tag to User Pool', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, 'TestAuth', { environment: 'dev' });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolTags: Match.objectLike({ Stack: 'TestAuth' }),
    });
  });
});
