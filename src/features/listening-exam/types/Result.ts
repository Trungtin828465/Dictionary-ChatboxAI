import { QuestionListening } from "./Question";

export interface UserAnswer {
  questionId: string;
  answerId: string;
  isMarked: boolean;
}

export interface ResultRequest {
  finishedTime: number;
  examId: string;
  userId: string;
  status: string;
  userAnswers: UserAnswer[];
}

// Backend response types
export interface BackendResultResponse {
  id: string;
  finishedTime: number;
  status: string;
  listeningExam: {
    id: string;
    name: string;
    topic: {
      idTopic: string;
      name: string;
      proficiency: {
        id: string;
        name: string;
        band: string;
        description: string;
        skill: string | null;
      };
    };
    time: number;
    skill: string;
    numberOfQuestions: number;
    infor: {
      transcript: string;
      audioUrl: string;
      imageUrl: string;
      direction: string;
    };
  };
  userId: string;
  result: BackendQuestionResult[];
}

export interface BackendQuestionResult {
  question: {
    id: string;
    content: string;
    typeQuestion: string;
    infor: {
      imageUrl: string;
      descriptionResult: string;
    };
    options: {
      id: string;
      symbol: string;
      description: string;
      isCorrect: boolean;
    }[];
  };
  answerId: string;
  isCorrect: boolean;
  isMarked: boolean;
}

// Frontend types (existing)
export interface Result {
  id: string;
  title: string;
  finishedTime: number;
  overallScore: number;
  infor: {
    transcript: string;
    audioUrl: string;
    imageUrl: string;
    direction: string;
  };
  results: QuestionListening[];
}

// Mapping function to convert backend response to frontend Result type
export const mapBackendResponseToResult = (
  backendResponse: BackendResultResponse,
): Result => {
  const result = {
    id: backendResponse.id,
    title: backendResponse.listeningExam.name,
    finishedTime: backendResponse.finishedTime,
    overallScore: 0,
    infor: {
      transcript: backendResponse.listeningExam.infor.transcript,
      audioUrl: backendResponse.listeningExam.infor.audioUrl,
      imageUrl: backendResponse.listeningExam.infor.imageUrl,
      direction: backendResponse.listeningExam.infor.direction,
    },
    results: backendResponse.result.map((questionResult) => ({
      id: questionResult.question.id,
      content: questionResult.question.content,
      img: questionResult.question.infor.imageUrl,
      script: questionResult.question.infor.descriptionResult,
      type: {
        id:
          questionResult.question.typeQuestion === "Choose the correct answer"
            ? "C"
            : "F",
        name: questionResult.question.typeQuestion,
        isCorrect: questionResult.isCorrect,
      },
      options: sortOptionsBySymbol(questionResult.question.options).map(
        (option) => ({
          id: option.id,
          symbol: option.symbol,
          description: option.description,
          isSelected: option.id === questionResult.answerId,
          isCorrect: option.isCorrect,
        }),
      ),
    })),
  };
  return result;
};

// Utility function to sort options by symbol A to Z
export const sortOptionsBySymbol = <T extends { symbol: string }>(
  options: T[],
): T[] => {
  return options.sort((a, b) => a.symbol.localeCompare(b.symbol));
};
