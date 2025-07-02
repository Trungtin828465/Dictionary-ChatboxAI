import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Picture/style.css";

const BASE_URL = import.meta.env.VITE_BE_API_URL;

type Exam = {
  idExam: string;
  nameExam: string;
  topicID: string;
  topicName: string;
  skill: string;
};

type UserExamResult = {
  id: string;
  userId: string;
  examId: string;
  finishedTime: string;
  overallScore: number;
  createdAt: string;
  updatedAt: string;
};

function Question() {
  const topicID = sessionStorage.getItem("topicId");
  const topicName = sessionStorage.getItem("topicName");
  const userId = sessionStorage.getItem("userId"); // Make sure you have userId in sessionStorage

  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<string[]>([]); // Stores IDs of completed exams
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!topicID) throw new Error("Không có topicID");

        // Fetch user's completed exams first
        const userExamsResponse = await fetch(
          `${BASE_URL}api/QuestionPicture/UserExam`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (userExamsResponse.ok) {
          const userExams: UserExamResult[] = await userExamsResponse.json();
          setCompletedExams(userExams.map((exam) => exam.examId));
        }

        // Then fetch all exams for the topic
        const examsResponse = await fetch(
          `${BASE_URL}api/Exam?topicId=${topicID}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!examsResponse.ok) throw new Error(`Lỗi: ${examsResponse.status}`);

        const data: Exam[] = await examsResponse.json();
        const pictureExams = data.filter((exam) => exam.skill === "Picture");

        setExams(pictureExams);

        if (pictureExams.length === 0) {
          setError("Không có bộ đề Picture nào cho topic này.");
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách bộ đề");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicID, userId]);

  const navigate = useNavigate();

  const handleClick = (exam: Exam) => {
    sessionStorage.setItem("examId", exam.idExam);
    sessionStorage.setItem("examName", exam.nameExam);
    navigate("/question-detail");
  };

  // Check if an exam has been completed by the user
  const isExamCompleted = (examId: string) => {
    return completedExams.includes(examId);
  };

  return (
    <div className="question-wrapper">
      <div className="sets-container">
        <h2>
          DANH SÁCH BỘ ĐỀ PICTURE:{" "}
          <span>{topicName || "Không có topic được chọn"}</span>
        </h2>
        <div className="sets-list">
          {loading ? (
            <p className="loading">Đang tải danh sách bộ đề...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : exams.length === 0 ? (
            <p className="error">Không có bộ đề Picture nào cho topic này.</p>
          ) : (
            exams.map((exam) => (
              <div
                key={exam.idExam}
                className={`set-box ${
                  isExamCompleted(exam.idExam) ? "completed-exam" : ""
                }`}
                onClick={() => handleClick(exam)}
              >
                <h3>{exam.nameExam}</h3>
                <p className="skill-badge">{exam.skill}</p>
                {isExamCompleted(exam.idExam) && (
                  <div className="completion-badge">Đã hoàn thành</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="welcome-message">
        <h2>
          Are you ready?
          <br />
          10 to 30 Questions - 10 minutes to prove your skills!
        </h2>
      </div>
    </div>
  );
}

export default Question;
