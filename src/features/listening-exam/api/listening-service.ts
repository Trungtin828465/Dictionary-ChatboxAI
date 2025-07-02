import { api } from "@/services/api-client";
import { Band } from "../types/Bands";
import { ListeningExam, ListeningExamResponse } from "../types/ListeningExam";
import {
  Result,
  ResultRequest,
  BackendResultResponse,
  mapBackendResponseToResult,
  sortOptionsBySymbol,
} from "../types/Result";
import { UserExamList, ListeningUserExam } from "../types/UserExam";

const BASE_URL = import.meta.env.VITE_BE_API_URL;

export const listeningService = {
  getProficiencyList: async () => {
    try {
      const response = await api.get<Band[]>(
        `${BASE_URL}api/Proficiency/Proficiency/skill?skill=Listening`,
      );

      const sortedResponse = response.sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
      });

      return sortedResponse.map((item: any) => ({
        id: item.id,
        name: item.name,
        band: item.band,
        description: item.description,
      }));
    } catch (error) {
      console.error("Failed to fetch proficiency list:", error);
      throw error;
    }
  },

  getListeningExamList: async (proficiencyId: string) => {
    try {
      const response = await api.get<ListeningExam[]>(
        `${BASE_URL}api/Exam/listenings?proficiencyId=${proficiencyId}`,
      );
      return response.map((item: any) => ({
        id: item.id,
        topic: {
          id: item.topic.idTopic,
          name: item.topic.proficiency.name,
          description: item.topic.skill,
        },
        title: item.name,
        description: item.infor.direction,
        skill: item.topic.skill,
        time: item.time,
        numberQuestion: item.numberOfQuestions,
      }));
    } catch (error) {
      console.error("Failed to fetch listening exam list by band id:", error);
      throw error;
    }
  },

  getListeningExamById: async (examId: string) => {
    try {
      const response = await api.get<any>(
        `${BASE_URL}api/Exam/listening/${examId}`,
      );
      var listeningExam: ListeningExamResponse = {
        id: response.id,
        title: response.name,
        description: response.topic.name, // or response.description if available
        topic: {
          id: response.topic.idTopic,
          name: response.topic.proficiency.name,
          description: response.topic.skill,
        },
        skill: response.topic.skill,
        time: response.time,
        transcript: response.infor.transcript,
        audioUrl: response.infor.audioUrl,
        imageUrl: response.infor.imageUrl,
        direction: response.infor.direction,
        questions: response.questions?.map((question: any) => ({
          id: question.id,
          content: question.content,
          typeQuestion: question.typeQuestion,
          imageUrl: question.infor.imageUrl,
          descriptionResult: question.infor.descriptionResult,
          options: sortOptionsBySymbol(question.options || []).map(
            (option: any) => ({
              id: option.id,
              symbol: option.symbol,
              description: option.description,
            }),
          ),
        })),
      };
      return listeningExam;
    } catch (error) {
      console.error("Failed to fetch listening exam:", error);
      throw error;
    }
  },

  getSimilarExams: async (examId: string, userId: string) => {
    try {
      //call getUserExam and then filter to ecept examId
      const userExamList = await listeningService.getUserExam(userId);
      const filteredExams = userExamList.data.filter(
        (exam) => exam.examId !== examId,
      );
      return filteredExams;
    } catch (error) {}
  },

  getUserExam: async (userId: string): Promise<UserExamList> => {
    try {
      const response = await api.get<ListeningUserExam[]>(
        `${BASE_URL}api/UserExam/listening?userId=${userId}`,
      );

      return {
        user_id: userId,
        data: response,
      };
    } catch (error) {
      console.error("Failed to fetch user exams:", error);
      return {
        user_id: userId,
        data: [],
      };
    }
  },

  postResult: async (result: ResultRequest, status: string) => {
    try {
      const requestData = {
        finishedTime: result.finishedTime,
        status: status,
        examId: result.examId,
        userId: result.userId.toString(),
        userAnswers: result.userAnswers,
      };

      console.log("Request data:", JSON.stringify(requestData, null, 2));

      const response = await api.post<BackendResultResponse>(
        `${BASE_URL}api/UserExam/listening`,
        requestData,
      );
      return response;
    } catch (error) {
      console.error("Failed to post result:", error);
      if (error instanceof Error && "response" in error) {
        console.error("Error response data:", (error as any).response?.data);
      }
      throw error;
    }
  },

  getResult: async (resultId: string): Promise<Result> => {
    try {
      const backendResponse = await api.get<BackendResultResponse>(
        `${BASE_URL}api/UserExam/listening/${resultId}`,
      );
      return mapBackendResponseToResult(backendResponse);
    } catch (error) {
      console.error("Failed to fetch result:", error);
      throw error;
    }
  },

  countCorrectAnswers: (result: Result | null) => {
    let correctCount = 0;

    for (const question of result?.results ?? []) {
      if (question.options && question.options.length > 0) {
        // For multiple choice questions, count the number of options marked as correct
        correctCount += question.options.filter(
          (opt) => opt.isCorrect === true && opt.isSelected === true,
        ).length;
      } else if (question.type && question.type.isCorrect === true) {
        // For other question types (like fill-in-the-blank), count as 1 if isCorrect is true
        correctCount += 1;
      }
    }

    return correctCount;
  },

  countIncorrectAnswers: (result: Result) => {
    let incorrectCount = 0;

    for (const question of result.results) {
      if (question.options && question.options.length > 0) {
        incorrectCount += question.options.filter(
          (opt) => opt.isCorrect === false && opt.isSelected === true,
        ).length;
      } else if (question.type && question.type.isCorrect === false) {
        incorrectCount += 1;
      }
    }

    return incorrectCount;
  },
};
