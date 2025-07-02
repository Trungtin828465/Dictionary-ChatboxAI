import React, { useEffect, useState } from "react";
import "../Picture/style.css";
import { useAuth } from "@/contexts/auth-context";

interface ImageOption {
  imageCode: string;
  isCorrect: number;
  questionImagesText: string;
  url?: string;
}

interface Question {
  questionID: string;
  questionType: string;
  textQuestion: string;
  correctImg?: string;
  correctAnswer?: string;
  imageOptions?: ImageOption[];
  correctImgUrl?: string;
}

const QuestionDetail: React.FC = () => {
  const BASE_URL = import.meta.env.VITE_BE_API_URL;
  const examId = sessionStorage.getItem("examId");
  const examName = sessionStorage.getItem("examName");
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedImg, setSelectedImg] = useState<number | null>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fetchImageUrl = async (imageId: string): Promise<string> => {
    const url = `https://api.pexels.com/v1/photos/${imageId}`;
    const res = await fetch(url, {
      headers: {
        Authorization:
          "I54Xi9H1qxwBx6zi59ESdXwDrqvEiHG9lbSfMHMlayxpuPtm9Z87HZt6",
      },
    });

    if (!res.ok) return "https://via.placeholder.com/100?text=Error";

    const data = await res.json();
    return data?.src?.medium || "https://via.placeholder.com/100?text=No+Image";
  };

  const markExamAsCompleted = async () => {
    try {
      const response = await fetch(`${BASE_URL}api/QuestionPicture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          examId: examId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark exam as completed");
      }

      console.log("Exam marked as completed successfully");
    } catch (error) {
      console.error("Error marking exam as completed:", error);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!examId) throw new Error("Không có examId");
        const res = await fetch(
          `${BASE_URL}api/QuestionPicture/QuestionTextImg?questionSetId=${examId}`,
        );
        if (!res.ok) throw new Error(await res.text());

        const rawData: Question[] = await res.json();

        const loadedQuestions = await Promise.all(
          rawData.map(async (q) => {
            if (q.questionType === "1" && q.correctImg) {
              const url = await fetchImageUrl(q.correctImg);
              return { ...q, correctImgUrl: url };
            }
            if (q.questionType === "2" && q.imageOptions) {
              const updatedOptions = await Promise.all(
                q.imageOptions.map(async (opt) => ({
                  ...opt,
                  url: await fetchImageUrl(opt.imageCode),
                })),
              );
              return { ...q, imageOptions: updatedOptions };
            }
            return q;
          }),
        );

        setQuestions(loadedQuestions);
        setLoading(false);
      } catch (err) {
        setFeedback(`Lỗi: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  const handleImageSelect = (i: number) => {
    setSelectedImg(i);
    setSubmitDisabled(false);
    setFeedback("");
    setIsCorrectAnswer(null);
    setShouldAnimate(false);
  };

  const handleSubmit = () => {
    const q = questions[index];
    let correct = false;

    if (q.questionType === "1") {
      correct =
        userAnswer.trim().toLowerCase() === q.correctAnswer?.toLowerCase();
    } else if (q.questionType === "2" && selectedImg !== null) {
      correct = q.imageOptions?.[selectedImg]?.isCorrect === 1;
    }

    setIsCorrectAnswer(correct);
    setShouldAnimate(true);

    if (correct) {
      setFeedback("🎉 Chính xác! Tuyệt vời!");
      setNextDisabled(false);
    } else {
      setFeedback("❌ Sai rồi, hãy thử lại.");
    }

    setSubmitDisabled(true);
  };

  const handleNext = async () => {
    // If this is the last question, mark exam as completed
    if (index === questions.length - 1) {
      await markExamAsCompleted();
      setCompleted(true);
    }

    setIndex((prev) => prev + 1);
    setFeedback("");
    setUserAnswer("");
    setSelectedImg(null);
    setSubmitDisabled(true);
    setNextDisabled(true);
    setIsCorrectAnswer(null);
    setShouldAnimate(false);
  };

  const renderQuestion = () => {
    const q = questions[index];

    if (completed) {
      return (
        <div className="completion-message">
          <p className="complete">Chúc mừng bạn đã hoàn thành bộ câu hỏi!</p>
          <p className="complete">Kết quả của bạn đã được lưu lại.</p>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            Quay về trang chủ
          </button>
        </div>
      );
    }

    if (!q)
      return (
        <p className="complete">Chúc mừng bạn đã hoàn thành bộ câu hỏi.</p>
      );

    return (
      <>
        <p className="question-text">{q.textQuestion}</p>
        {q.questionType === "1" && (
          <>
            <img
              src={
                q.correctImgUrl ||
                "https://via.placeholder.com/100?text=No+Image"
              }
              alt="question"
              className="question-img"
            />
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Nhập đáp án"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setSubmitDisabled(!e.target.value.trim());
                if (feedback) {
                  setFeedback("");
                  setIsCorrectAnswer(null);
                  setShouldAnimate(false);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !submitDisabled) {
                  handleSubmit();
                }
              }}
            />
          </>
        )}
        {q.questionType === "2" && (
          <div className="image-options-wrapper">
            {q.imageOptions?.map((opt, i) => (
              <div key={i} className="image-option-container">
                <img
                  src={
                    opt.url || "https://via.placeholder.com/100?text=No+Image"
                  }
                  className={`image-option ${
                    selectedImg === i ? "selected" : ""
                  }`}
                  alt={opt.questionImagesText}
                  onClick={() => handleImageSelect(i)}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`wrapper ${
        shouldAnimate
          ? isCorrectAnswer
            ? "animate-correct"
            : "animate-incorrect"
          : ""
      }`}
    >
      <h2>
        DANH SÁCH CÂU HỎI <span>{examName || "Không có bộ đề"}</span>
      </h2>
      {loading ? <p>Đang tải câu hỏi...</p> : renderQuestion()}
      {feedback && !completed && (
        <div
          className={`feedback ${isCorrectAnswer ? "correct" : "incorrect"}`}
        >
          {feedback}
        </div>
      )}
      {!completed && (
        <div className="button-group mt-3">
          <button
            className="btn btn-primary"
            disabled={submitDisabled}
            onClick={handleSubmit}
          >
            Gửi đáp án
          </button>
          <button
            className="btn btn-secondary ms-2"
            disabled={nextDisabled}
            onClick={handleNext}
          >
            {index === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
