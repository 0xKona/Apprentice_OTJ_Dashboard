/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTrainingLog = /* GraphQL */ `query GetTrainingLog($id: ID!) {
  getTrainingLog(id: $id) {
    activity
    createdAt
    date
    durationHours
    endTime
    id
    impactOfLearning
    newLearning
    owner
    startTime
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTrainingLogQueryVariables,
  APITypes.GetTrainingLogQuery
>;
export const ingestLogs = /* GraphQL */ `query IngestLogs($files: [String!]!) {
  ingestLogs(files: $files)
}
` as GeneratedQuery<
  APITypes.IngestLogsQueryVariables,
  APITypes.IngestLogsQuery
>;
export const listTrainingLogs = /* GraphQL */ `query ListTrainingLogs(
  $filter: ModelTrainingLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listTrainingLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      activity
      createdAt
      date
      durationHours
      endTime
      id
      impactOfLearning
      newLearning
      owner
      startTime
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTrainingLogsQueryVariables,
  APITypes.ListTrainingLogsQuery
>;
