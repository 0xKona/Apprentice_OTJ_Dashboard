/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TrainingLog = {
  __typename: "TrainingLog",
  activity: string,
  createdAt: string,
  date: string,
  durationHours: number,
  endTime: string,
  id: string,
  impactOfLearning: string,
  newLearning: string,
  owner?: string | null,
  startTime: string,
  updatedAt: string,
  userId: string,
};

export type ModelTrainingLogFilterInput = {
  activity?: ModelStringInput | null,
  and?: Array< ModelTrainingLogFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  durationHours?: ModelFloatInput | null,
  endTime?: ModelStringInput | null,
  id?: ModelIDInput | null,
  impactOfLearning?: ModelStringInput | null,
  newLearning?: ModelStringInput | null,
  not?: ModelTrainingLogFilterInput | null,
  or?: Array< ModelTrainingLogFilterInput | null > | null,
  owner?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelFloatInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelTrainingLogConnection = {
  __typename: "ModelTrainingLogConnection",
  items:  Array<TrainingLog | null >,
  nextToken?: string | null,
};

export type ModelTrainingLogConditionInput = {
  activity?: ModelStringInput | null,
  and?: Array< ModelTrainingLogConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  durationHours?: ModelFloatInput | null,
  endTime?: ModelStringInput | null,
  impactOfLearning?: ModelStringInput | null,
  newLearning?: ModelStringInput | null,
  not?: ModelTrainingLogConditionInput | null,
  or?: Array< ModelTrainingLogConditionInput | null > | null,
  owner?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateTrainingLogInput = {
  activity: string,
  date: string,
  durationHours: number,
  endTime: string,
  id?: string | null,
  impactOfLearning: string,
  newLearning: string,
  startTime: string,
  userId: string,
};

export type DeleteTrainingLogInput = {
  id: string,
};

export type UpdateTrainingLogInput = {
  activity?: string | null,
  date?: string | null,
  durationHours?: number | null,
  endTime?: string | null,
  id: string,
  impactOfLearning?: string | null,
  newLearning?: string | null,
  startTime?: string | null,
  userId?: string | null,
};

export type ModelSubscriptionTrainingLogFilterInput = {
  activity?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTrainingLogFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  date?: ModelSubscriptionStringInput | null,
  durationHours?: ModelSubscriptionFloatInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  impactOfLearning?: ModelSubscriptionStringInput | null,
  newLearning?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionTrainingLogFilterInput | null > | null,
  owner?: ModelStringInput | null,
  startTime?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionFloatInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type GetTrainingLogQueryVariables = {
  id: string,
};

export type GetTrainingLogQuery = {
  getTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type IngestLogsQueryVariables = {
  files: Array< string >,
};

export type IngestLogsQuery = {
  ingestLogs?: string | null,
};

export type ListTrainingLogsQueryVariables = {
  filter?: ModelTrainingLogFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTrainingLogsQuery = {
  listTrainingLogs?:  {
    __typename: "ModelTrainingLogConnection",
    items:  Array< {
      __typename: "TrainingLog",
      activity: string,
      createdAt: string,
      date: string,
      durationHours: number,
      endTime: string,
      id: string,
      impactOfLearning: string,
      newLearning: string,
      owner?: string | null,
      startTime: string,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateTrainingLogMutationVariables = {
  condition?: ModelTrainingLogConditionInput | null,
  input: CreateTrainingLogInput,
};

export type CreateTrainingLogMutation = {
  createTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type DeleteTrainingLogMutationVariables = {
  condition?: ModelTrainingLogConditionInput | null,
  input: DeleteTrainingLogInput,
};

export type DeleteTrainingLogMutation = {
  deleteTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type UpdateTrainingLogMutationVariables = {
  condition?: ModelTrainingLogConditionInput | null,
  input: UpdateTrainingLogInput,
};

export type UpdateTrainingLogMutation = {
  updateTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnCreateTrainingLogSubscriptionVariables = {
  filter?: ModelSubscriptionTrainingLogFilterInput | null,
  owner?: string | null,
};

export type OnCreateTrainingLogSubscription = {
  onCreateTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnDeleteTrainingLogSubscriptionVariables = {
  filter?: ModelSubscriptionTrainingLogFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTrainingLogSubscription = {
  onDeleteTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnUpdateTrainingLogSubscriptionVariables = {
  filter?: ModelSubscriptionTrainingLogFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTrainingLogSubscription = {
  onUpdateTrainingLog?:  {
    __typename: "TrainingLog",
    activity: string,
    createdAt: string,
    date: string,
    durationHours: number,
    endTime: string,
    id: string,
    impactOfLearning: string,
    newLearning: string,
    owner?: string | null,
    startTime: string,
    updatedAt: string,
    userId: string,
  } | null,
};
