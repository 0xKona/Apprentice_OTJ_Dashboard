import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const username = ctx.identity.sub;
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({
      PK: `USER#${username}`,
      SK: `USAGE#${ctx.args.date}`,
    }),
  };
}

export function response(ctx) {
  const item = ctx.result;
  if (!item) return null;
  if (item.userId !== ctx.identity.sub) {
    util.unauthorized();
  }
  return item;
}
