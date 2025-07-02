import CircleIcon from "@/assets/icons/circle.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import { useNavigate } from "react-router-dom";
import { ListeningExam } from "../../types/ListeningExam";
import styles from "../style.module.scss";

interface TestItemProps {
  mainColor: string;
  secondaryColor: string;
  exam: ListeningExam;
}

const TestItem = ({ exam, mainColor, secondaryColor }: TestItemProps) => {
  const gradient = `linear-gradient(90deg, ${mainColor} 0%, ${secondaryColor} 100%)`;
  const navigate = useNavigate();

  const handleStartExam = (exam: ListeningExam) => {
    navigate(`/testing/${exam.id}`);
  };

  // Helper function to get status text and text color based on main color
  const getStatusInfo = (mainColor: string) => {
    switch (mainColor) {
      case "#914BFB":
        return {
          text: "Đã hoàn thành",
          textColor: "#fff",
        };
      case "#FFBF47":
        return {
          text: "Đang làm",
          textColor: "#000",
        };
      case "#31e3a5":
        return {
          text: "Đề mới",
          textColor: "#fff",
        };
      default:
        return {
          text: "Đề mới",
          textColor: "#fff",
        };
    }
  };

  const { text: statusText, textColor } = getStatusInfo(mainColor);

  return (
    <div className={styles.testCard}>
      <div className={styles.testCardHeader}>
        <div
          style={{
            width: "30px",
            height: "30px",
            background: gradient,
            position: "relative",
            backgroundColor: `linear-gradient(90deg, ${mainColor}, #fff) 1`,
          }}
        >
          <img src={CircleIcon} alt="circle" className={styles.circleIcon} />
        </div>

        {/* 1line and overflow by three dots */}
        <h4 className="font-medium line-clamp-1 truncate">{exam.title}</h4>
      </div>
      <div className={styles.testCardQuestion}>
        <img src={QuestionIcon} alt="question" />
        <p>{exam.numberQuestion} câu hỏi</p>
      </div>
      <div className={styles.testCardTopic}>
        <p>
          Dạng: <span>{exam.topic.name}</span>
        </p>
      </div>

      <div
        style={{
          width: "max-content",
          background: gradient,
          borderRadius: "8px",
          padding: "0.5rem 1rem",
          color: textColor,
          fontWeight: "bold",
          display: "inline-block",
        }}
      >
        <p
          className="text-[12px]"
          style={{
            color: textColor,
          }}
        >
          <span>{statusText}</span>
        </p>
      </div>
      <button
        className="text-[13px] font-medium hover:border-1 hover:border-[#000]"
        onClick={() => {
          handleStartExam(exam);
        }}
      >
        Bắt đầu ngay
      </button>
    </div>
  );
};

export default TestItem;
