import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";

interface StackOutputs {
  userPoolId: string;
  userPoolClientId: string;
  apiUrl: string;
}

async function getStackOutputs(
  cfn: CloudFormationClient,
  stackName: string
): Promise<Record<string, string>> {
  const { Stacks } = await cfn.send(
    new DescribeStacksCommand({ StackName: stackName })
  );

  if (!Stacks || Stacks.length === 0) {
    throw new Error(`Stack "${stackName}" not found. Has it been deployed?`);
  }

  const outputs: Record<string, string> = {};
  for (const o of Stacks[0].Outputs ?? []) {
    if (o.OutputKey && o.OutputValue) {
      outputs[o.OutputKey] = o.OutputValue;
    }
  }
  return outputs;
}

function requireOutput(
  outputs: Record<string, string>,
  key: string,
  stackName: string
): string {
  const value = outputs[key];
  if (!value) {
    throw new Error(
      `Missing output "${key}" in stack "${stackName}". ` +
        "Ensure the stack has been deployed successfully."
    );
  }
  return value;
}

export function formatEnvLines(outputs: StackOutputs): string {
  const lines = [
    `NEXT_PUBLIC_AWS_REGION=eu-west-2`,
    `NEXT_PUBLIC_USER_POOL_ID=${outputs.userPoolId}`,
    `NEXT_PUBLIC_USER_POOL_CLIENT_ID=${outputs.userPoolClientId}`,
    `NEXT_PUBLIC_API_URL=${outputs.apiUrl}`,
  ];
  return lines.join("\n");
}

async function main(): Promise<void> {
  const region = "eu-west-2";
  const environment = process.env.ENVIRONMENT ?? "prod";
  const cfn = new CloudFormationClient({ region });

  const [authOutputs, dataOutputs] = await Promise.all([
    getStackOutputs(cfn, `OTJobber-Auth-${environment}`),
    getStackOutputs(cfn, `OTJobber-Data-${environment}`),
  ]);

  const stackOutputs: StackOutputs = {
    userPoolId: requireOutput(authOutputs, "UserPoolId", `OTJobber-Auth-${environment}`),
    userPoolClientId: requireOutput(
      authOutputs,
      "UserPoolClientId",
      `OTJobber-Auth-${environment}`
    ),
    apiUrl: requireOutput(dataOutputs, "ApiUrl", `OTJobber-Data-${environment}`),
  };

  console.log(formatEnvLines(stackOutputs));
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
