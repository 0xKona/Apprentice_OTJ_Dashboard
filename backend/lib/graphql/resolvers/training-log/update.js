import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { input } = ctx.args;
  const username = ctx.identity.sub;
  const now = util.time.nowISO8601();

  const expressionParts = ['updatedAt = :updatedAt'];
  const expressionValues = { ':updatedAt': now, ':owner': `USER#${username}` };
  const expressionNames = {};

  if (input.startTime !== undefined) {
    expressionParts.push('startTime = :startTime');
    expressionValues[':startTime'] = input.startTime;
  }
  if (input.endTime !== undefined) {
    expressionParts.push('endTime = :endTime');
    expressionValues[':endTime'] = input.endTime;
  }
  if (input.durationHours !== undefined) {
    expressionParts.push('durationHours = :durationHours');
    expressionValues[':durationHours'] = input.durationHours;
  }
  if (input.activity !== undefined) {
    expressionParts.push('activity = :activity');
    expressionValues[':activity'] = input.activity;
  }
  if (input.newLearning !== undefined) {
    expressionParts.push('newLearning = :newLearning');
    expressionValues[':newLearning'] = input.newLearning;
  }
  if (input.impactOfLearning !== undefined) {
    expressionParts.push('impactOfLearning = :impactOfLearning');
    expressionValues[':impactOfLearning'] = input.impactOfLearning;
  }

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      PK: `USER#${username}`,
      SK: `LOG#${input.date}#${input.id}`,
    }),
    update: {
      expression: `SET ${expressionParts.join(', ')}`,
      expressionNames,
      expressionValues: util.dynamodb.toMapValues(expressionValues),
    },
    condition: {
      expression: 'PK = :owner',
      expressionValues: util.dynamodb.toMapValues({ ':owner': `USER#${username}` }),
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
