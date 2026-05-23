export interface TrainingLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  activity: string;
  newLearning: string;
  impactOfLearning: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
