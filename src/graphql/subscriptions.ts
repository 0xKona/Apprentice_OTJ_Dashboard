/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTrainingLog = /* GraphQL */ `subscription OnCreateTrainingLog(
  $filter: ModelSubscriptionTrainingLogFilterInput
  $owner: String
) {
  onCreateTrainingLog(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTrainingLogSubscriptionVariables,
  APITypes.OnCreateTrainingLogSubscription
>;
export const onDeleteTrainingLog = /* GraphQL */ `subscription OnDeleteTrainingLog(
  $filter: ModelSubscriptionTrainingLogFilterInput
  $owner: String
) {
  onDeleteTrainingLog(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTrainingLogSubscriptionVariables,
  APITypes.OnDeleteTrainingLogSubscription
>;
export const onUpdateTrainingLog = /* GraphQL */ `subscription OnUpdateTrainingLog(
  $filter: ModelSubscriptionTrainingLogFilterInput
  $owner: String
) {
  onUpdateTrainingLog(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTrainingLogSubscriptionVariables,
  APITypes.OnUpdateTrainingLogSubscription
>;
