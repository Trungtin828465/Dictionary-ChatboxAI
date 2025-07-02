import { Answers } from "@/features/listening-exam/types/Answer";
import { QuestionListeningResponse } from "@/features/listening-exam/types/Question";
import { useState } from "react";
import Checklist from "./Checklist/Checklist";
import styles from "./style.module.scss";
import Timer from "./Timer/Timer";

interface TimeAndAnwersProps {
  hour: number;
  minute: number;
  second: number;
  handlePlay: () => void;
  handleStop: () => void;
  listOfQuestions: QuestionListeningResponse[];
  ListOfAnswers: Answers[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  handleOpenDialog: () => void;
}

const TimeAndAnwers = ({
  hour,
  minute,
  second,
  handlePlay,
  handleStop,
  listOfQuestions,
  ListOfAnswers,
  currentIndex,
  setCurrentIndex,
  handleOpenDialog,
}: TimeAndAnwersProps) => {
  const [isRunning, setIsRunning] = useState(true);

  const handleStopAndContinue = () => {
    setIsRunning(!isRunning);
    if (isRunning) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  return (
    <div className={styles.timeAndAnswers}>
      <div className="w-full flex flex-col gap-4">
        <h3 className="text-left">Thời gian còn lại</h3>
        <Timer hour={hour} minute={minute} second={second} />
      </div>

      <div className="w-full flex flex-col gap-4">
        <h3 className="text-left mt-6">Danh sách câu hỏi</h3>
        <Checklist
          listOfQuestions={listOfQuestions}
          ListOfAnswers={ListOfAnswers}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </div>
      <div className={styles.timeAndAnswersNote}>
        <div className={styles.timeAndAnswersNoteItem}>
          <div className="w-4 h-4 bg-[#31E3A5] rounded-sm"></div>
          <p>Câu hỏi đã có đáp án</p>
        </div>
        <div className={styles.timeAndAnswersNoteItem}>
          <div className="w-4 h-4 bg-[#37474F] rounded-sm"></div>
          <p>Câu hỏi được đánh dấu để xem lại</p>
        </div>
        <div className={styles.timeAndAnswersNoteItem}>
          <div className="w-4 h-4 bg-white border border-[#37474F] rounded-sm"></div>
          <p>Câu hỏi chưa có đáp án</p>
        </div>
      </div>
      <div className={styles.timeAndAnswersButton}>
        <button onClick={handleStopAndContinue} className={styles.borderButton}>
          {isRunning ? "Dừng" : "Tiếp tục"}
        </button>
        <div className={styles.submitButton}>
          <button onClick={handleOpenDialog}>Nộp bài</button>
        </div>
      </div>
    </div>
  );
};

export default TimeAndAnwers;
