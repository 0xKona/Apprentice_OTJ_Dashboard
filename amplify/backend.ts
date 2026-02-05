import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Tags } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { IConstruct } from 'constructs';

const backend = defineBackend({
  auth,
  data,
});

const environment = process.env.AWS_BRANCH || 'local';

const tagResource = (resource: IConstruct) => {
  Tags.of(resource).add('Application', 'OTJobber');
  Tags.of(resource).add('Environment', environment);
};

// Tag auth resources
tagResource(backend.auth.resources.userPool);
tagResource(backend.auth.resources.userPoolClient);

// Tag data resources (tables)
tagResource(backend.data.resources.tables.TrainingLog);
tagResource(backend.data.resources.tables.AiUsage);

// Add necessary IAM policies to roles for Bedrock access
Object.values(backend.data.resources.roles).forEach(role => {
  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
  );
  tagResource(role);
});