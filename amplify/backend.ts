import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Stack, Tags } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
});

function applyProjectTags(stack: Stack, component: string) {
  const environment = process.env.AWS_BRANCH || process.env.NODE_ENV || 'local';
  const branch = process.env.AWS_BRANCH || 'local';

  Tags.of(stack).add('Application', 'OTJobber');
  Tags.of(stack).add('Component', component);
  Tags.of(stack).add('Environment', environment);
  Tags.of(stack).add('Branch', branch);
  Tags.of(stack).add('ManagedBy', 'Amplify-Gen2');
}

// Get the underlying CDK stacks
const authStack = Stack.of(backend.auth.resources.userPool);
const dataStack = Stack.of(backend.data);

// Apply tags to auth stack
applyProjectTags(authStack, 'Auth');
applyProjectTags(dataStack, 'Data');

// Add necessary IAM policies to roles for Bedrock access
Object.values(backend.data.resources.roles).forEach(role => {
  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
  );
});