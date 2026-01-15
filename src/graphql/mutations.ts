/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTrainingLog = /* GraphQL */ `mutation CreateTrainingLog(
  $condition: ModelTrainingLogConditionInput
  $input: CreateTrainingLogInput!
) {
  createTrainingLog(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateTrainingLogMutationVariables,
  APITypes.CreateTrainingLogMutation
>;
export const deleteTrainingLog = /* GraphQL */ `mutation DeleteTrainingLog(
  $condition: ModelTrainingLogConditionInput
  $input: DeleteTrainingLogInput!
) {
  deleteTrainingLog(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteTrainingLogMutationVariables,
  APITypes.DeleteTrainingLogMutation
>;
export const updateTrainingLog = /* GraphQL */ `mutation UpdateTrainingLog(
  $condition: ModelTrainingLogConditionInput
  $input: UpdateTrainingLogInput!
) {
  updateTrainingLog(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateTrainingLogMutationVariables,
  APITypes.UpdateTrainingLogMutation
>;
