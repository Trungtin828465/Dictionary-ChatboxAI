import { api } from "@/services/api-client";
import { Band } from "../Types/Bands";

export interface Topic {
  id: string;
  name: string;
  proficienciesId: string;
}

export interface PdfDocument {
  id: number;
  fileName: string;
  content: string;
  uploadDate: string;
  fileSize: number;
  fileData: string | null;
}

export interface Exam {
  id: string;
  name: string;
  time: number;
  skill: string;
  pdfDocuments: PdfDocument[];
  totalQuestions: number;
}

export interface TestInfo {
  testId: number;
  testTitle: string;
  totalQuestions: number;
}

export interface SubmitAnswerRequest {
  UserAnswers: string[];
  AccountId: string;
  StartTime: string;
}

export interface AnswerDetail {
  questionNumber: number;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface AnswerCheckResponse {
  testTitle: string;
  totalQuestions: number;
  pdfId: number;
  results: AnswerDetail[];
  timeTakenSeconds?: number;
}

export interface SubmitAnswerResponse {
  testTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  details: AnswerDetail[];
  submissionId: number;
  timeTakenSeconds: number;
  accountId: string;
}

export interface ExamDetail {
  questionNumber: number;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExamResult {
  testTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  notAnswered: number;
  score: number;
  details: ExamDetail[];
  submissionId: number;
}

const BASE_URL = import.meta.env.VITE_BE_API_URL;

export const readingService = {
  getProficiencyList: async () => {
    try {
      const response = await api.get<Band[]>(
        `${BASE_URL}api/Proficiency/Proficiency-raeding`,
      );

      return response.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        band: item.band,
        skill: item.skill,
      }));
    } catch (error) {
      console.error("Failed to fetch proficiency list (reading):", error);
      throw error;
    }
  },
  getTopicsByProficiencyId: async (proficiencyId: string) => {
    try {
      const response = await api.get<Topic[]>(
        `${BASE_URL}api/Pdf/topics?proficiencyId=${proficiencyId}`,
      );
      return response;
    } catch (error) {
      console.error(
        "Failed to fetch topics by proficiencyId (reading):",
        error,
      );
      throw error;
    }
  },
  getExamsByTopicId: async (topicId: string) => {
    try {
      const response = await api.get<Exam[]>(
        `${BASE_URL}api/Pdf/exams?topicId=${topicId}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch exams by topicId (reading):", error);
      throw error;
    }
  },
  getTestInfo: async (testId: string) => {
    try {
      const response = await api.get<TestInfo>(
        `${BASE_URL}api/user/UserAnswer/reading/info/${testId}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch test info:", error);
      throw error;
    }
  },
  getPdfMetadata: async (testId: string) => {
    try {
      const response = await api.get<PdfDocument>(
        `${BASE_URL}api/Pdf/${testId}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch PDF metadata:", error);
      throw error;
    }
  },
  getPdfContent: async (testId: string | number) => {
    try {
      const response = await fetch(`${BASE_URL}api/Pdf/view/${testId}`, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PDF: ${response.status} ${response.statusText}`,
        );
      }

      return await response.blob();
    } catch (error) {
      console.error("Failed to fetch PDF content:", error);
      throw error;
    }
  },
  submitAnswers: async (testId: string, payload: SubmitAnswerRequest) => {
    try {
      const response = await api.post<SubmitAnswerResponse>(
        `${BASE_URL}api/user/UserAnswer/submit/${testId}`,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Failed to submit answers:", error);
      throw error;
    }
  },
  getExamResult: async (submissionId: string) => {
    try {
      const response = await api.get<ExamResult>(
        `${BASE_URL}api/user/UserAnswer/result/${submissionId}`,
      );
      const details = response.details;
      const notAnswered = details.filter(
        (detail: ExamDetail) => !detail.userAnswer,
      ).length;
      const wrongAnswers = details.filter(
        (detail: ExamDetail) => detail.userAnswer && !detail.isCorrect,
      ).length;
      return {
        ...response,
        wrongAnswers,
        notAnswered,
      };
    } catch (error) {
      console.error("Failed to fetch exam result:", error);
      throw error;
    }
  },
  getSubmissionReview: async (submissionId: number) => {
    try {
      const response = await api.get<AnswerCheckResponse>(
        `${BASE_URL}api/user/UserAnswer/review/${submissionId}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch submission review:", error);
      throw error;
    }
  },
};
