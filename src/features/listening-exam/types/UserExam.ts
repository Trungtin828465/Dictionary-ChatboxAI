export interface ListeningUserExam {
  id: string;
  finishedTime: number;
  overallScore: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  examId: string;
}

export interface UserExamList {
  user_id: string;
  data: ListeningUserExam[];
}
