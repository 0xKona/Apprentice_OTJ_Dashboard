import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { DataStack } from './data-stack';
import { AiStack } from './ai-stack';

function createStack() {
  const app = new cdk.App();
  const authStack = new cdk.Stack(app, 'Auth');
  const userPool = new cognito.UserPool(authStack, 'Pool');
  const dataStack = new DataStack(app, 'OTJobber-Data-dev', {
    environment: 'dev',
    userPool,
  });
  const aiStack = new AiStack(app, 'OTJobber-Ai-dev', {
    environment: 'dev',
    api: dataStack.api,
    dataTable: dataStack.dataTable,
  });
  return Template.fromStack(aiStack);
}

test('creates Lambda with Python 3.12 and correct config', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'OTJobber-GenerateImprovement-dev',
    Runtime: 'python3.12',
    Timeout: 30,
    MemorySize: 256,
  });
});

test('Lambda has SnapStart enabled', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::Lambda::Function', {
    SnapStart: { ApplyOn: 'PublishedVersions' },
  });
});

test('Lambda has Bedrock invoke permission', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'bedrock:InvokeModel',
          Effect: 'Allow',
        }),
      ]),
    },
  });
});

test('creates AppSync Lambda resolver for generateImprovement', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::AppSync::Resolver', {
    TypeName: 'Mutation',
    FieldName: 'generateImprovement',
  });
});

test('applies Stack tag', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::Lambda::Function', {
    Tags: Match.arrayWith([
      Match.objectLike({ Key: 'Stack', Value: 'OTJobber-Ai-dev' }),
    ]),
  });
});
