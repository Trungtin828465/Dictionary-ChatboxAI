import { Answers } from "@/features/listening-exam/types/Answer";
import { QuestionListeningResponse } from "@/features/listening-exam/types/Question";
import styles from "./styles.module.scss";

interface ChecklistProps {
  listOfQuestions: QuestionListeningResponse[];
  ListOfAnswers: Answers[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const Checklist = ({
  listOfQuestions,
  ListOfAnswers,
  currentIndex,
  setCurrentIndex,
}: ChecklistProps) => {
  return (
    <div className={styles.checklist}>
      {listOfQuestions.map((question, index) => {
        const answer = ListOfAnswers.find((a) => a.questionId === question.id);
        let itemClass = styles.default;
        if (answer?.isMarked) {
          itemClass = styles.marked;
        } else if (answer?.answer) {
          itemClass = styles.answered;
        }
        return (
          <div
            className={`${styles.checklistItem} ${itemClass} ${
              index === currentIndex ? styles.active : ""
            }`}
            key={question.id}
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

export default Checklist;
