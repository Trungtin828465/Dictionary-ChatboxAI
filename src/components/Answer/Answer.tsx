import { cn } from "@/lib/utils";

interface AnswerProps {
  symbol: string;
  description: string;
  handleClick: () => void;
  isSelected?: boolean;
}

const Answer = ({
  symbol,
  description,
  handleClick,
  isSelected,
}: AnswerProps) => {
  return (
    <div
      className={`w-full flex flex-row gap-4 items-center cursor-pointer`}
      onClick={handleClick}
    >
      <p>{symbol}</p>
      <div
        className={cn(
          `w-full border-2 border-gray-300 px-6 py-3 rounded-md ${
            isSelected ? "border-2 border-[#31E3A5] " : ""
          }`,
        )}
      >
        <p className="text-[14px] text-left">{description}</p>
      </div>
    </div>
  );
};

export default Answer;
