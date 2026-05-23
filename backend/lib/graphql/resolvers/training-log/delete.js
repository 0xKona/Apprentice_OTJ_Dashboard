import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const username = ctx.identity.sub;
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      PK: `USER#${username}`,
      SK: `LOG#${ctx.args.id}`,
    }),
    condition: {
      expression: 'PK = :owner',
      expressionValues: util.dynamodb.toMapValues({ ':owner': `USER#${username}` }),
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
