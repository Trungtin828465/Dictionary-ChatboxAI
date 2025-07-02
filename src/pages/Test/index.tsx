import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api-client";
import styles from "./styles.module.scss";

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  vietnameseMeaning: string;
  workspaceId: string;
  type?: string;
}

export default function TestPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizType, setQuizType] = useState<"en" | "vi">("en");
  const [results, setResults] = useState<
    {
      quizType: "en" | "vi";
      userAnswer: string;
      correct: boolean;
      correctAnswer: string;
      question: string;
    }[]
  >([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.get<VocabularyItem[]>(`/api/v1/Dictionary`);
      const filtered = data.filter((item) => item.workspaceId === workspaceId);
      setVocabularyItems(filtered);
      setQuizType(Math.random() > 0.5 ? "en" : "vi");
    };
    fetchData();
  }, [workspaceId]);

  if (!vocabularyItems.length) {
    return (
      <div className={styles.container}>Không có từ vựng để kiểm tra.</div>
    );
  }

  const current = vocabularyItems[currentIndex];

  const handleCheck = () => {
    let correct = false;
    let correctAnswer = "";
    let question = "";
    if (quizType === "en") {
      correct =
        userAnswer.trim().toLowerCase() === current.word.trim().toLowerCase();
      correctAnswer = current.word;
      question = current.vietnameseMeaning;
    } else {
      correct =
        userAnswer.trim().toLowerCase() ===
        current.vietnameseMeaning.trim().toLowerCase();
      correctAnswer = current.vietnameseMeaning;
      question = current.word + (current.type ? ` (${current.type})` : "");
    }
    setIsCorrect(correct);
    setShowResult(true);
    setResults((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        quizType,
        userAnswer,
        correct,
        correctAnswer,
        question,
      };
      return next;
    });
  };

  const handleNext = () => {
    setUserAnswer("");
    setShowResult(false);
    setIsCorrect(null);
    setQuizType(Math.random() > 0.5 ? "en" : "vi");
    setCurrentIndex((idx) => idx + 1);
  };

  const handleFinish = () => {
    setShowSummary(true);
  };

  if (showSummary) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kết quả kiểm tra</h2>
        <div className={styles.summaryList}>
          {vocabularyItems.map((item, idx) => (
            <div
              key={item.id}
              className={
                results[idx]?.correct
                  ? styles.summaryCorrect
                  : styles.summaryIncorrect
              }
            >
              <div className={styles.summaryQuestion}>
                <b>Câu {idx + 1}:</b> {results[idx]?.question}
              </div>
              <div>
                Đáp án của bạn: <b>{results[idx]?.userAnswer || "(bỏ qua)"}</b>
              </div>
              <div>
                Đáp án đúng: <b>{results[idx]?.correctAnswer}</b>
              </div>
              <div>Kết quả: {results[idx]?.correct ? "Đúng" : "Sai"}</div>
            </div>
          ))}
        </div>
        <button className={styles.finishButton} onClick={() => navigate(-1)}>
          Quay về
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
      <h2 className={styles.title}>Kiểm tra từ vựng</h2>
      <div className={styles.quizBox}>
        <div className={styles.quizContent}>
          {quizType === "en" ? (
            <>
              <div className={styles.label}>Nghĩa tiếng Việt:</div>
              <div className={styles.question}>{current.vietnameseMeaning}</div>
              <input
                className={styles.input}
                placeholder="Nhập từ tiếng Anh"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showResult}
              />
            </>
          ) : (
            <>
              <div className={styles.label}>Từ tiếng Anh:</div>
              <div className={styles.question}>
                {current.word}
                {current.type && (
                  <span className={styles.typeBadge}>{current.type}</span>
                )}
              </div>
              <input
                className={styles.input}
                placeholder="Nhập nghĩa tiếng Việt"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showResult}
              />
            </>
          )}
        </div>
        {showResult && (
          <div className={isCorrect ? styles.correct : styles.incorrect}>
            {isCorrect
              ? "Chính xác!"
              : `Sai. Đáp án đúng: ${quizType === "en" ? current.word : current.vietnameseMeaning}`}
          </div>
        )}
        <div className={styles.actions}>
          {!showResult ? (
            <button className={styles.checkButton} onClick={handleCheck}>
              Kiểm tra
            </button>
          ) : currentIndex < vocabularyItems.length - 1 ? (
            <button className={styles.nextButton} onClick={handleNext}>
              Tiếp theo
            </button>
          ) : (
            <button className={styles.finishButton} onClick={handleFinish}>
              Kết thúc
            </button>
          )}
        </div>
      </div>
      <div className={styles.progress}>
        {currentIndex + 1} / {vocabularyItems.length}
      </div>
    </div>
  );
}
