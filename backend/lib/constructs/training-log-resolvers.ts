import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as path from 'path';

export interface TrainingLogResolversProps {
  api: appsync.GraphqlApi;
  dataSource: appsync.DynamoDbDataSource;
}

export class TrainingLogResolvers extends Construct {
  constructor(scope: Construct, id: string, props: TrainingLogResolversProps) {
    super(scope, id);

    const resolversDir = path.join(__dirname, '../graphql/resolvers/training-log');

    props.dataSource.createResolver('CreateTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'createTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'create.js')),
    });

    props.dataSource.createResolver('GetTrainingLog', {
      typeName: 'Query',
      fieldName: 'getTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'get.js')),
    });

    props.dataSource.createResolver('ListTrainingLogs', {
      typeName: 'Query',
      fieldName: 'listTrainingLogs',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'list.js')),
    });

    props.dataSource.createResolver('UpdateTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'updateTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'update.js')),
    });

    props.dataSource.createResolver('DeleteTrainingLog', {
      typeName: 'Mutation',
      fieldName: 'deleteTrainingLog',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(path.join(resolversDir, 'delete.js')),
    });
  }
}
