import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { Environment, validateEnvironment, removalPolicy } from '../config';
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
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, '../graphql/schema.graphql')),
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
    const resolversDir = path.join(__dirname, '../graphql/resolvers');

    // TrainingLog resolvers
    ddbSource.createResolver('CreateTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'createTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'training-log/create.js')),
    });

    ddbSource.createResolver('GetTrainingLog', {
      typeName: 'Query',
      fieldName: 'getTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'training-log/get.js')),
    });

    ddbSource.createResolver('ListTrainingLogs', {
      typeName: 'Query',
      fieldName: 'listTrainingLogs',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'training-log/list.js')),
    });

    ddbSource.createResolver('UpdateTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'updateTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'training-log/update.js')),
    });

    ddbSource.createResolver('DeleteTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'deleteTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'training-log/delete.js')),
    });

    // AiUsage resolvers
    ddbSource.createResolver('GetAiUsage', {
      typeName: 'Query',
      fieldName: 'getAiUsage',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'ai-usage/get.js')),
    });

    ddbSource.createResolver('ListAiUsages', {
      typeName: 'Query',
      fieldName: 'listAiUsages',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'ai-usage/list.js')),
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.graphqlUrl });
    new cdk.CfnOutput(this, 'ApiId', { value: this.api.apiId });
    new cdk.CfnOutput(this, 'TableName', { value: this.dataTable.tableName });
  }
}
