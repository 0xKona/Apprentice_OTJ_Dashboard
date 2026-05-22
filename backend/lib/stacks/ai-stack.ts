import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Environment, validateEnvironment } from '../config';
import * as path from 'path';

export interface AiStackProps extends cdk.StackProps {
  environment: Environment;
  api: appsync.GraphqlApi;
  dataTable: dynamodb.ITable;
}

export class AiStack extends cdk.Stack {
  public readonly generateImprovementFn: lambda.Function;

  constructor(scope: Construct, id: string, props: AiStackProps) {
    super(scope, id, props);
    validateEnvironment(props.environment);
    cdk.Tags.of(this).add('Stack', id);

    const dailyLimit = props.environment === 'prod' ? '25' : '1000';

    this.generateImprovementFn = new lambda.Function(this, 'GenerateImprovementFn', {
      functionName: `OTJobber-GenerateImprovement-${props.environment}`,
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handler.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/generate-improvement')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: props.dataTable.tableName,
        DAILY_LIMIT: dailyLimit,
        BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
      },
      snapStart: lambda.SnapStartConf.ON_PUBLISHED_VERSIONS,
    });

    // Bedrock invoke permission
    this.generateImprovementFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: [`arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-lite-v1:0`],
    }));

    // DynamoDB permissions for rate limiting
    props.dataTable.grant(this.generateImprovementFn, 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:PutItem');

    // Wire as AppSync resolver
    const lambdaSource = props.api.addLambdaDataSource('GenerateImprovementSource', this.generateImprovementFn);
    lambdaSource.createResolver('GenerateImprovement', {
      typeName: 'Mutation',
      fieldName: 'generateImprovement',
    });
  }
}
