import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Environment, validateEnvironment } from '../config';

export interface BackendStackProps extends cdk.StackProps {
  environment: Environment;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);
    validateEnvironment(props.environment);
    cdk.Tags.of(this).add('Stack', id);
  }
}
