import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  data,
});

const tags = Tags.of(backend.stack);
// Tag for project for billing purposes
tags.add('project', 'otjobber');
