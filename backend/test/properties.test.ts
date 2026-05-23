import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { execSync } from 'child_process';
import { AuthStack } from '../lib/stacks/auth-stack';

const BACKEND_ROOT = path.resolve(__dirname, '..');

describe('Property 1: Isolation', () => {
  it('no TypeScript import resolves outside backend/ or node_modules/', () => {
    const tsFiles = findTsFiles(BACKEND_ROOT, ['node_modules', 'cdk.out', 'dist']);
    expect(tsFiles.length).toBeGreaterThan(0);

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const importMatches = content.matchAll(/(?:import|from)\s+['"](\.[^'"]+)['"]/g);
      for (const match of importMatches) {
        const resolved = path.resolve(path.dirname(file), match[1]);
        expect(resolved.startsWith(BACKEND_ROOT)).toBe(true);
      }
    }
  });
});

describe('Property 3: Synthesis Validity', () => {
  it.each(['dev', 'staging', 'prod'] as const)('produces valid CloudFormation for %s', (env) => {
    const app = new cdk.App();
    const stack = new AuthStack(app, `Test-${env}`, { environment: env });
    const template = Template.fromStack(stack);
    const json = template.toJSON();
    // Valid CF template synthesized without errors
    expect(json).toBeDefined();
    expect(typeof json).toBe('object');
  });
});

describe('Property 4: Tag Consistency', () => {
  it.each(['dev', 'staging', 'prod'] as const)('tags propagate to child resources for %s', (env) => {
    const app = new cdk.App();
    const stack = new AuthStack(app, `Tag-Test-${env}`, { environment: env });
    cdk.Tags.of(app).add('Application', 'OTJobber');
    cdk.Tags.of(app).add('Environment', env);
    cdk.Tags.of(app).add('ManagedBy', 'CDK');

    // Add a dummy taggable resource
    new sqs.Queue(stack, 'TestQueue');

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SQS::Queue', {
      Tags: [
        { Key: 'Application', Value: 'OTJobber' },
        { Key: 'Environment', Value: env },
        { Key: 'ManagedBy', Value: 'CDK' },
        { Key: 'Stack', Value: `Tag-Test-${env}` },
      ],
    });
  });
});

describe('Property 5: Stack Naming Convention', () => {
  it.each(['dev', 'staging', 'prod'] as const)('stack ID matches OTJobber-Auth-%s', (env) => {
    const app = new cdk.App();
    const stackId = `OTJobber-Auth-${env}`;
    new AuthStack(app, stackId, { environment: env });
    const assembly = app.synth();
    expect(assembly.getStackByName(stackId)).toBeDefined();
  });
});

describe('Property 7: Independent TypeScript Compilation', () => {
  it('tsconfig.json has no extends field', () => {
    const tsconfig = JSON.parse(fs.readFileSync(path.join(BACKEND_ROOT, 'tsconfig.json'), 'utf-8'));
    expect(tsconfig.extends).toBeUndefined();
  });

  it('tsconfig has fully specified compilerOptions for CDK', () => {
    const tsconfig = JSON.parse(fs.readFileSync(path.join(BACKEND_ROOT, 'tsconfig.json'), 'utf-8'));
    const opts = tsconfig.compilerOptions;
    expect(opts.target).toBeDefined();
    expect(opts.module).toBeDefined();
    expect(opts.strict).toBe(true);
    expect(opts.declaration).toBe(true);
    expect(opts.esModuleInterop).toBe(true);
  });

  it('tsc --noEmit succeeds from backend directory', () => {
    const result = execSync('npx tsc --noEmit', { cwd: BACKEND_ROOT, encoding: 'utf-8' });
    expect(result).toBeDefined();
  });
});

function findTsFiles(dir: string, exclude: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTsFiles(full, exclude));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) results.push(full);
  }
  return results;
}
