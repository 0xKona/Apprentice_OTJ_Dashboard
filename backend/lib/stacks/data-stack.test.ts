import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { DataStack } from './data-stack';

function createStack() {
  const app = new cdk.App();
  const authStack = new cdk.Stack(app, 'Auth');
  const userPool = new cognito.UserPool(authStack, 'Pool');
  const stack = new DataStack(app, 'OTJobber-Data-dev', {
    environment: 'dev',
    userPool,
  });
  return Template.fromStack(stack);
}

test('creates DynamoDB table with PK/SK', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'OTJobber-Data-dev',
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });
});

test('creates GSI1 on table', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    GlobalSecondaryIndexes: Match.arrayWith([
      Match.objectLike({
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
      }),
    ]),
  });
});

test('creates AppSync API with Cognito auth', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
    Name: 'OTJobber-API-dev',
    AuthenticationType: 'AMAZON_COGNITO_USER_POOLS',
  });
});

test('has CloudFormation outputs', () => {
  const template = createStack();
  template.hasOutput('ApiUrl', {});
  template.hasOutput('ApiId', {});
  template.hasOutput('TableName', {});
});

test('applies Stack tag', () => {
  const template = createStack();
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    Tags: Match.arrayWith([
      Match.objectLike({ Key: 'Stack', Value: 'OTJobber-Data-dev' }),
    ]),
  });
});
