import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./TestQuestionPage.module.scss";

// --- Interfaces ---
interface Option {
  answerId: number;
  answerText: string;
}

interface QuestionDto {
  questionId: number;
  questionOrder: number;
  questionText: string;
  answers: Option[];
  audioUrl?: string;
}

type AnswerState = Record<number, string>;

interface UserTestStartResponse {
  userTestId: number;
  testId: number;
  startTime: string;
  timeLimit: number;
}

interface UserTestStatusResponse {
  userTestId: number;
  testId: number;
  isCompleted: boolean;
  timeRemaining: number;
  answeredQuestions: number;
  totalQuestions: number;
  markedForReview: number;
}

interface UserTestSubmitResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
}

// --- Constants ---
const API_BASE_URL = "http://localhost:5299/api";
const POLL_INTERVAL = 1000; // 11 seconds
const DEFAULT_USER_ID = 1;

// --- Main Component ---
const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // --- State Variables ---
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [userTestId, setUserTestId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [blankAnswerInput, setBlankAnswerInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Derived Values ---
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );
  const isLastQuestion = useMemo(
    () => currentQuestionIndex === questions.length - 1,
    [currentQuestionIndex, questions.length],
  );
  const isFirstQuestion = useMemo(
    () => currentQuestionIndex === 0,
    [currentQuestionIndex],
  );
  const selectedOptionId = useMemo(
    () => answers[currentQuestion?.questionId] || "",
    [answers, currentQuestion?.questionId],
  );
  const isCurrentQuestionMarked = useMemo(
    () => currentQuestion && markedQuestions.has(currentQuestion.questionId),
    [currentQuestion, markedQuestions],
  );

  // --- API Helpers ---
  const fetchWithErrorHandling = useCallback(
    async (url: string, options?: RequestInit) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    [],
  );

  // --- API Functions ---
  const startTest = useCallback(async () => {
    if (!testId) throw new Error("Test ID is required");

    const data = await fetchWithErrorHandling(
      `${API_BASE_URL}/usertests/start`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          testId: parseInt(testId),
        }),
      },
    );

    const startData: UserTestStartResponse = data;
    setUserTestId(startData.userTestId);

    // Set initial time
    const initialTotalSeconds = startData.timeLimit * 60;
    updateTimeDisplay(initialTotalSeconds);

    return startData;
  }, [testId, fetchWithErrorHandling]);

  const fetchQuestions = useCallback(
    async (testId: string) => {
      const data = await fetchWithErrorHandling(
        `${API_BASE_URL}/Tests/${testId}`,
      );
      return data.questions.map((q: any) => ({
        questionId: q.questionId,
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        answers: q.answers || [],
        audioUrl: q.audioUrl,
      }));
    },
    [fetchWithErrorHandling],
  );

  const saveAnswer = useCallback(
    async (
      questionId: number,
      selectedAnswerId: number | null,
      isMarked: boolean,
    ) => {
      if (!userTestId) return;

      await fetchWithErrorHandling(`${API_BASE_URL}/usertests/save-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTestId,
          questionId,
          answerId: selectedAnswerId,
          isMarkedForReview: isMarked,
        }),
      });
    },
    [userTestId, fetchWithErrorHandling],
  );

  const fetchTestStatus = useCallback(async () => {
    if (!userTestId) return null;

    const data = await fetchWithErrorHandling(
      `${API_BASE_URL}/usertests/status/${userTestId}`,
    );
    return data as UserTestStatusResponse;
  }, [userTestId, fetchWithErrorHandling]);

  const submitTest = useCallback(async () => {
    if (!userTestId) throw new Error("userTestId is not set");

    const data = await fetchWithErrorHandling(
      `${API_BASE_URL}/usertests/submit/${userTestId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    return data as UserTestSubmitResponse;
  }, [userTestId, fetchWithErrorHandling]);

  // --- Utility Functions ---
  const updateTimeDisplay = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    setTimeRemaining({ hours, minutes, seconds });
  }, []);

  // --- Handlers ---
  const handleOptionChange = useCallback(
    (questionId: number, selectedAnswerId: number) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: selectedAnswerId.toString(),
      }));

      saveAnswer(questionId, selectedAnswerId, markedQuestions.has(questionId));
    },
    [markedQuestions, saveAnswer],
  );

  const handleBlankInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!currentQuestion) return;

      setBlankAnswerInput(value);
      setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: value }));
      saveAnswer(
        currentQuestion.questionId,
        0,
        markedQuestions.has(currentQuestion.questionId),
      );
    },
    [currentQuestion, markedQuestions, saveAnswer],
  );

  const handleNavigation = useCallback(
    (direction: "next" | "prev" | number) => {
      if (typeof direction === "number") {
        setCurrentQuestionIndex(direction);
        return;
      }

      setCurrentQuestionIndex((prev) => {
        if (direction === "next")
          return Math.min(prev + 1, questions.length - 1);
        return Math.max(prev - 1, 0);
      });
    },
    [questions.length],
  );

  const handleExit = useCallback(() => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn thoát khỏi bài kiểm tra? Tiến độ của bạn có thể không được lưu nếu bạn không nộp bài.",
      )
    ) {
      navigate("/");
    }
  }, [navigate]);

  // const handleSubmit = useCallback(async () => {
  //   if (!userTestId) {
  //     alert("Bài kiểm tra chưa được bắt đầu hoặc userTestId không hợp lệ.");
  //     return;
  //   }

  //   if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;

  //   try {
  //     const resultData = await submitTest();
  //     alert("Bài thi đã được nộp thành công!");
  //     navigate(`/test-results/${userTestId}`, { state: { resultData } });
  //   } catch (err) {
  //     console.error("Error submitting test:", err);
  //     alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
  //   }
  // }, [userTestId, navigate, submitTest]);

  // Inside TestPage.tsx, handleSubmit function:
  const handleSubmit = useCallback(async () => {
    if (!userTestId) {
      alert("Bài kiểm tra chưa được bắt đầu hoặc userTestId không hợp lệ.");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;

    try {
      const resultData = await submitTest(); // This calls your API to submit and get results
      alert("Bài thi đã được nộp thành công!");
      // Navigate to the results page, passing data in state
      navigate(`/test-results/${userTestId}`, { state: { resultData } });
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
    }
  }, [userTestId, navigate, submitTest]);

  const toggleMarkQuestion = useCallback(() => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.questionId;
    const newMarkedState = !markedQuestions.has(questionId);

    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newMarkedState) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });

    const answerId = currentQuestion.questionText.includes("_____")
      ? 0
      : answers[questionId]
        ? parseInt(answers[questionId])
        : null;

    saveAnswer(questionId, answerId, newMarkedState);
  }, [currentQuestion, answers, markedQuestions, saveAnswer]);

  // --- Effects ---
  useEffect(() => {
    const initializeTest = async () => {
      if (!testId) {
        setError("Test ID không hợp lệ.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const questionsData = await fetchQuestions(testId);
        setQuestions(questionsData);
      } catch (err: any) {
        console.error("Error initializing test:", err);
        setError(
          `Không thể tải bài kiểm tra: ${err.message}. Vui lòng thử lại.`,
        );
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    initializeTest();
  }, [testId, navigate, startTest, fetchQuestions]);

  useEffect(() => {
    if (currentQuestion?.questionText.includes("_____")) {
      setBlankAnswerInput(answers[currentQuestion.questionId] || "");
    } else {
      setBlankAnswerInput("");
    }
  }, [currentQuestion, answers]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!userTestId) return;

      try {
        const statusData = await fetchTestStatus();
        if (!statusData) return;

        const secondsFromApi = Math.max(
          0,
          Math.floor(statusData.timeRemaining),
        );
        updateTimeDisplay(secondsFromApi);

        if (statusData.isCompleted || secondsFromApi <= 0) {
          clearInterval(timerInterval);
          handleSubmit();
        }
      } catch (err) {
        console.error("Error fetching test status:", err);
      }
    };

    if (userTestId) {
      pollStatus();
      timerInterval = setInterval(pollStatus, POLL_INTERVAL);
    }

    return () => clearInterval(timerInterval);
  }, [userTestId, handleSubmit, fetchTestStatus, updateTimeDisplay]);

  // --- Render Helpers ---
  const formatTime = (unit: number) => unit.toString().padStart(2, "0");

  const renderQuestionContent = useCallback(
    (content: string) => {
      const parts = content.split("_____");
      if (parts.length > 1) {
        return (
          <>
            {parts[0]}
            <input
              type="text"
              className={styles.blankInput}
              value={blankAnswerInput}
              onChange={handleBlankInputChange}
              placeholder="Điền vào chỗ trống"
            />
            {parts.slice(1).join("_____")}
          </>
        );
      }
      return content;
    },
    [blankAnswerInput, handleBlankInputChange],
  );

  const questionNavNumbers = useMemo(() => {
    if (questions.length === 0) return [];

    const start = Math.max(0, currentQuestionIndex - 1);
    const end = Math.min(questions.length - 1, currentQuestionIndex + 1);

    return questions.slice(start, end + 1).map((q) => q.questionOrder);
  }, [currentQuestionIndex, questions]);

  // --- Render Logic ---
  if (isLoading) {
    return <div className={styles.container}>Đang tải đề thi...</div>;
  }

  if (error) {
    return (
      <div className={styles.container} style={{ color: "red" }}>
        Lỗi: {error}
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className={styles.container}>Không tìm thấy câu hỏi nào.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.questionNav}>
          {questionNavNumbers.map((num) => (
            <span
              key={num}
              className={
                num === currentQuestion.questionOrder
                  ? styles.currentQuestionNav
                  : ""
              }
            >
              Câu {num}
            </span>
          ))}
        </div>

        <div className={styles.questionContainer}>
          {currentQuestion.audioUrl && (
            <audio
              controls
              src={currentQuestion.audioUrl}
              className={styles.audioPlayer}
            >
              Your browser does not support the audio element.
            </audio>
          )}
          <p className={styles.questionText}>
            <strong>Câu hỏi {currentQuestion.questionOrder}:</strong>{" "}
            {renderQuestionContent(currentQuestion.questionText)}
          </p>

          {currentQuestion.answers?.length > 0 && (
            <div className={styles.optionsContainer}>
              {currentQuestion.answers.map((option, idx) => (
                <div key={option.answerId} className={styles.optionItem}>
                  <label
                    className={`${styles.optionLabel} ${
                      selectedOptionId === option.answerId.toString()
                        ? styles.selectedOption
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.questionId}`}
                      value={option.answerId.toString()}
                      checked={selectedOptionId === option.answerId.toString()}
                      onChange={() =>
                        handleOptionChange(
                          currentQuestion.questionId,
                          option.answerId,
                        )
                      }
                      className={styles.optionInput}
                    />
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option.answerText}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.navigationRow}>
          <button
            onClick={toggleMarkQuestion}
            className={`${styles.markButton} ${
              isCurrentQuestionMarked ? styles.marked : ""
            }`}
          >
            Đánh dấu để xem lại
          </button>
          <div className={styles.navButtons}>
            <button
              onClick={() => handleNavigation("prev")}
              disabled={isFirstQuestion}
              className={styles.navButton}
            >
              Trở lại
            </button>
            <button
              onClick={() => handleNavigation("next")}
              disabled={isLastQuestion}
              className={styles.navButton}
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.timerContainer}>
          <h3 className={styles.timerTitle}>Thời gian còn lại</h3>
          <div className={styles.timerDisplay}>
            {["hours", "minutes", "seconds"].map((unit) => (
              <React.Fragment key={unit}>
                <div className={styles.timeUnit}>
                  <div className={styles.timeValue}>
                    {formatTime(
                      timeRemaining[unit as keyof typeof timeRemaining],
                    )}
                  </div>
                  <div className={styles.timeLabel}>
                    {unit === "hours"
                      ? "Giờ"
                      : unit === "minutes"
                        ? "Phút"
                        : "Giây"}
                  </div>
                </div>
                {unit !== "seconds" && (
                  <div className={styles.timeSeparator}>:</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <h3 className={styles.answerGridTitle}>Câu trả lời</h3>
        <div className={styles.answerGrid}>
          {questions.map((q, index) => {
            const isAnswered =
              answers[q.questionId] !== undefined &&
              answers[q.questionId] !== "";
            const isMarked = markedQuestions.has(q.questionId);
            const isCurrent = currentQuestionIndex === index;

            return (
              <button
                key={q.questionId}
                onClick={() => handleNavigation(index)}
                className={`${styles.gridButton} ${
                  isAnswered ? styles.answered : ""
                } ${isMarked ? styles.marked : ""} ${
                  isCurrent ? styles.current : ""
                }`}
              >
                {q.questionOrder}
              </button>
            );
          })}
        </div>

        <div className={styles.statusLegend}>
          {[
            { className: styles.answered, label: "Câu đã trả lời" },
            { className: styles.marked, label: "Câu đánh dấu để xem lại" },
            { className: styles.unanswered, label: "Câu chưa trả lời" },
          ].map((item) => (
            <div key={item.label} className={styles.legendItem}>
              <div className={`${styles.legendColor} ${item.className}`}></div>
              <div>{item.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.footerButtons}>
          <button className={styles.exitButton} onClick={handleExit}>
            Thoát
          </button>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
