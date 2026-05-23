import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const id = util.autoId();
  const { input } = ctx.args;
  const username = ctx.identity.sub;
  const now = util.time.nowISO8601();

  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `USER#${username}`,
      SK: `LOG#${input.date}#${id}`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      id,
      GSI1PK: `LOG#${id}`,
      GSI1SK: `USER#${username}`,
      userId: username,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      durationHours: input.durationHours,
      activity: input.activity,
      newLearning: input.newLearning,
      impactOfLearning: input.impactOfLearning,
      createdAt: now,
      updatedAt: now,
    }),
  };
}

export function response(ctx) {
  return ctx.result;
}
