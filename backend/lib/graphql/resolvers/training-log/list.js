import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const username = ctx.identity.sub;
  const query = {
    operation: 'Query',
    query: {
      expression: 'PK = :pk AND begins_with(SK, :sk)',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `USER#${username}`,
        ':sk': 'LOG#',
      }),
    },
    scanIndexForward: false,
    limit: ctx.args.limit ?? 50,
  };
  if (ctx.args.nextToken) {
    query.nextToken = ctx.args.nextToken;
  }
  return query;
}

export function response(ctx) {
  return { items: ctx.result.items, nextToken: ctx.result.nextToken ?? null };
}
