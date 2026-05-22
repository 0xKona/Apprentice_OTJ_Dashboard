import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BackendStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const validEnvironments = ['dev', 'staging', 'prod'];
    if (!validEnvironments.includes(props.environment)) {
      throw new Error(`Invalid environment "${props.environment}". Must be one of: ${validEnvironments.join(', ')}`);
    }

    cdk.Tags.of(this).add('Stack', id);
  }
}
