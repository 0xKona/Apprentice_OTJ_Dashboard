import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Query',
    index: 'GSI1',
    query: {
      expression: 'GSI1PK = :pk',
      expressionValues: util.dynamodb.toMapValues({ ':pk': `LOG#${ctx.args.id}` }),
    },
  };
}

export function response(ctx) {
  const items = ctx.result.items;
  if (!items || items.length === 0) return null;
  const item = items[0];
  if (item.userId !== ctx.identity.username) {
    util.unauthorized();
  }
  return item;
}
