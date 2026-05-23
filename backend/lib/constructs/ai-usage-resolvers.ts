import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as path from 'path';

export interface AiUsageResolversProps {
  api: appsync.GraphqlApi;
  dataSource: appsync.DynamoDbDataSource;
}

export class AiUsageResolvers extends Construct {
  constructor(scope: Construct, id: string, props: AiUsageResolversProps) {
    super(scope, id);

    const resolversDir = path.join(__dirname, '../graphql/resolvers/ai-usage');

    props.dataSource.createResolver('GetAiUsage', {
      typeName: 'Query',
      fieldName: 'getAiUsage',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'get.js')),
    });

    props.dataSource.createResolver('ListAiUsages', {
      typeName: 'Query',
      fieldName: 'listAiUsages',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'list.js')),
    });
  }
}
