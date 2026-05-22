import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { Environment, validateEnvironment, removalPolicy } from '../config';
import { TrainingLogResolvers } from '../constructs/training-log-resolvers';
import { AiUsageResolvers } from '../constructs/ai-usage-resolvers';
import * as path from 'path';

export interface DataStackProps extends cdk.StackProps {
  environment: Environment;
  userPool: cognito.IUserPool;
}

export class DataStack extends cdk.Stack {
  public readonly api: appsync.GraphqlApi;
  public readonly dataTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    validateEnvironment(props.environment);
    cdk.Tags.of(this).add('Stack', id);

    this.dataTable = new dynamodb.Table(this, 'DataTable', {
      tableName: `OTJobber-Data-${props.environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: removalPolicy(props.environment),
    });

    this.dataTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.api = new appsync.GraphqlApi(this, 'Api', {
      name: `OTJobber-API-${props.environment}`,
      definition: appsync.Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: props.userPool },
        },
        additionalAuthorizationModes: [
          { authorizationType: appsync.AuthorizationType.IAM },
        ],
      },
      logConfig: {
        fieldLogLevel: props.environment === 'prod' ? appsync.FieldLogLevel.ERROR : appsync.FieldLogLevel.ALL,
      },
    });

    const ddbSource = this.api.addDynamoDbDataSource('DataTableSource', this.dataTable);

    new TrainingLogResolvers(this, 'TrainingLogResolvers', {
      api: this.api,
      dataSource: ddbSource,
    });

    new AiUsageResolvers(this, 'AiUsageResolvers', {
      api: this.api,
      dataSource: ddbSource,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.graphqlUrl });
    new cdk.CfnOutput(this, 'ApiId', { value: this.api.apiId });
    new cdk.CfnOutput(this, 'TableName', { value: this.dataTable.tableName });
  }
}
