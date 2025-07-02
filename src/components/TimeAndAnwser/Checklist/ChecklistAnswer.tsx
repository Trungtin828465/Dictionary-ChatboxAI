import { QuestionListening } from "@/features/listening-exam/types/Question";

interface ChecklistAnswerProps {
  listOfResult: QuestionListening[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const ChecklistAnswer = ({
  listOfResult,
  setCurrentIndex,
}: ChecklistAnswerProps) => {
  return (
    <div className="grid grid-cols-6 p-4 gap-2 bg-white rounded-[6px] shadow-[0_0_2px_0_rgba(123,138,131,0.4)] justify-between w-full">
      {listOfResult.map((result, index) => {
        return (
          <div
            className={`w-[35px] h-[35px] flex items-center justify-center gap-1 cursor-pointer rounded-[5px] ${
              result.options?.find((option) => option.isSelected === true)
                ?.isCorrect === true
                ? "bg-[#31E3A5] text-white"
                : result.options?.find((option) => option.isSelected === true)
                      ?.isCorrect === false
                  ? "bg-[#FF7C7C] text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
            key={result.id}
            onClick={() => {
              setCurrentIndex(index);
            }}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistAnswer;
