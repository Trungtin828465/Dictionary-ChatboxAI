import { Topic } from "./Exams";
import { QuestionListeningResponse } from "./Question";

export interface ListeningExam {
  id: string;
  topic: Topic;
  title: string;
  description: string;
  skill: string;
  time: number;
  numberQuestion: number;
}

// response from api
export interface ListeningExamResponse {
  id: string;
  topic: Topic;
  title: string;
  description: string;
  skill: string;
  time: number;
  transcript: string;
  audioUrl: string;
  imageUrl?: string;
  direction: string;
  questions: QuestionListeningResponse[];
}
