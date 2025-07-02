import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "./TestResultsPage.module.scss";

// --- Interfaces ---
interface UserTestSubmitResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  unansweredCount?: number; // Optional field for unanswered questions
}

// --- Constants ---
const API_BASE_URL = "http://localhost:5299/api";

// --- Main Component ---
const TestResultsPage: React.FC = () => {
  const { userTestId } = useParams<{ userTestId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState<UserTestSubmitResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      // Try to get data from navigation state first (passed from TestPage on submit)
      if (
        location.state &&
        (location.state as { resultData: UserTestSubmitResponse }).resultData
      ) {
        setResultData(
          (location.state as { resultData: UserTestSubmitResponse }).resultData,
        );
        setIsLoading(false);
        return;
      }

      // If not in state, fetch from API using userTestId
      if (!userTestId) {
        setError("User Test ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/usertests/submit/${userTestId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Test results not found for this ID.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserTestSubmitResponse = await response.json();
        setResultData(data);
      } catch (err: any) {
        console.error("Error fetching test results:", err);
        setError(`Failed to load test results: ${err.message}.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [userTestId, location.state]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewDetails = () => {
    alert("Chức năng 'Xem chi tiết bài làm' đang được phát triển!");
  };

  if (isLoading) {
    return <div className={styles.container}>Đang tải kết quả bài thi...</div>;
  }

  if (error) {
    return (
      <div className={styles.container} style={{ color: "red" }}>
        Lỗi: {error}
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className={styles.container}>Không có dữ liệu kết quả bài thi.</div>
    );
  }

  const { totalQuestions, correctAnswers, unansweredCount } = resultData;

  // Calculate incorrect answers (answered but wrong)
  const incorrectAnswers =
    totalQuestions - correctAnswers - (unansweredCount || 0);

  // Use provided unansweredCount or default to 0
  const unansweredQuestions = unansweredCount || 0;

  // Determine status based on correct answers
  const status = correctAnswers >= 3 ? "Tốt" : "Chưa tốt";

  // Format time as MM:SS
  // const minutes = Math.floor(timeTaken / 60);
  // const seconds = Math.floor(timeTaken % 60);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kết quả kiểm tra</h1>

      <div className={styles.illustration}>
        <img
          src=""
          alt="Thinking Person"
          className={styles.illustrationImage}
        />
      </div>

      <div className={styles.score}>
        <span className={styles.scoreValue}>
          {correctAnswers} / {totalQuestions} câu
        </span>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Số lượng câu đúng:</span>
          <span className={styles.detailValue}>{correctAnswers} câu</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Số lượng câu sai:</span>
          <span className={styles.detailValue}>{incorrectAnswers} câu</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Số lượng câu chưa làm:</span>
          <span className={styles.detailValue}>{unansweredQuestions} câu</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Trạng thái:</span>
          <span className={styles.status}>{status}</span>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button onClick={handleGoHome} className={styles.exitButton}>
          Thoát
        </button>
        <button
          onClick={handleViewDetails}
          className={styles.viewDetailsButton}
        >
          Xem chi tiết bài làm
        </button>
      </div>
    </div>
  );
};

export default TestResultsPage;
