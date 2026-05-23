export const createTrainingLog = /* GraphQL */ `
  mutation CreateTrainingLog($input: CreateTrainingLogInput!) {
    createTrainingLog(input: $input) {
      id
      date
      startTime
      endTime
      durationHours
      activity
      newLearning
      impactOfLearning
      userId
      createdAt
      updatedAt
    }
  }
`;

export const updateTrainingLog = /* GraphQL */ `
  mutation UpdateTrainingLog($input: UpdateTrainingLogInput!) {
    updateTrainingLog(input: $input) {
      id
      date
      startTime
      endTime
      durationHours
      activity
      newLearning
      impactOfLearning
      userId
      createdAt
      updatedAt
    }
  }
`;

export const deleteTrainingLog = /* GraphQL */ `
  mutation DeleteTrainingLog($id: ID!) {
    deleteTrainingLog(id: $id) {
      id
      date
    }
  }
`;

export const generateImprovement = /* GraphQL */ `
  mutation GenerateImprovement(
    $currentFieldContent: String
    $fieldName: String
    $fullLogContext: AWSJSON
  ) {
    generateImprovement(
      currentFieldContent: $currentFieldContent
      fieldName: $fieldName
      fullLogContext: $fullLogContext
    )
  }
`;
