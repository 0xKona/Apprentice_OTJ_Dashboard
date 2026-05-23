export const listTrainingLogs = /* GraphQL */ `
  query ListTrainingLogs($limit: Int, $nextToken: String) {
    listTrainingLogs(limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const getTrainingLog = /* GraphQL */ `
  query GetTrainingLog($id: ID!) {
    getTrainingLog(id: $id) {
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

export const getAiUsage = /* GraphQL */ `
  query GetAiUsage($date: String!) {
    getAiUsage(date: $date) {
      userId
      date
      count
      dailyLimit
      lastUpdated
    }
  }
`;

export const listAiUsages = /* GraphQL */ `
  query ListAiUsages($limit: Int, $nextToken: String) {
    listAiUsages(limit: $limit, nextToken: $nextToken) {
      items {
        userId
        date
        count
        dailyLimit
        lastUpdated
      }
      nextToken
    }
  }
`;
