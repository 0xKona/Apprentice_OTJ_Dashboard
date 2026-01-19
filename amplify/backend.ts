import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  data,
});

// Determine environment based on branch or sandbox
const branchName = process.env.AWS_BRANCH || 'sandbox';
const isSandbox = !process.env.AWS_BRANCH;
const environment = branchName === 'main' ? 'production' 
  : branchName === 'staging' ? 'staging'
  : isSandbox ? 'sandbox'
  : 'development';

// Get developer/owner info
const owner = isSandbox 
  ? process.env.USER || process.env.USERNAME || 'unknown-developer'
  : '0xKona';

const tags = Tags.of(backend.stack);

// Standard AWS tagging best practices
tags.add('Project', 'otjobber');
tags.add('Application', 'apprentice-otj-dashboard');
tags.add('Environment', environment);
tags.add('Branch', branchName);
tags.add('ManagedBy', 'amplify');
tags.add('Owner', owner);
tags.add('CostCenter', 'training-platform'); // For cost allocation
tags.add('Terraform', 'false'); // Useful for identifying IaC tool
tags.add('BackupPolicy', environment === 'production' ? 'daily' : 'none');

// Add resource-specific tags
Tags.of(backend.auth.resources.userPool).add('ResourceType', 'cognito-user-pool');
Tags.of(backend.auth.resources.userPool).add('DataClassification', 'confidential');

Tags.of(backend.data.resources.tables['TrainingLog']).add('ResourceType', 'dynamodb-table');
Tags.of(backend.data.resources.tables['TrainingLog']).add('DataClassification', 'internal');
Tags.of(backend.data.resources.tables['TrainingLog']).add('DataRetention', '7-years'); // Apprenticeship records