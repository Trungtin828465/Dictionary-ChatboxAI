export interface QuestionListening {
  id: string;
  content: string;
  script?: string;
  img?: string;
  type: {
    id: string;
    name: string;
    answerValue?: string; // for fill in the blank question
    correctValue?: string;
    isCorrect?: boolean; // for choose the correct answer question
  };
  options?: SelectedOption[];
  isEmpty?: boolean;
}

// response from api
export interface QuestionListeningResponse {
  id: string;
  content: string;
  typeQuestion: string;
  imageUrl: string;
  descriptionResult: string;
  options: SelectedOption[];
}

export interface SelectedOption {
  id: string;
  symbol: string;
  description: string;
  isSelected?: boolean;
  isCorrect?: boolean;
}
