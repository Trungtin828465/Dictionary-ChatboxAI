import { ChevronLeft, ChevronRight, Clock, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  PdfDocument,
  readingService,
  SubmitAnswerRequest,
  TestInfo,
} from "../api/reading-service";

interface AnswersState {
  [key: number]: string;
}

const ReadingTestInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTestTimeMinutes = (location.state as any)?.time || 30;

  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<PdfDocument | null>(null);

  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(
    initialTestTimeMinutes * 60,
  );
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      loadTestContent();
    } else {
      setError("ID đề thi không hợp lệ.");
      setLoading(false);
    }
  }, [id]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} phút ${secs} giây`;
  };

  const getTestTitle = (content: string, fileName: string): string => {
    if (!content) return fileName || "Đề thi Reading";
    const lines = content.split("\n").map((line) => line.trim());
    const meaningfulLine =
      lines.find((line) => line && !/^\d+$/.test(line)) ||
      fileName ||
      "Đề thi Reading";
    return meaningfulLine;
  };

  const loadTestContent = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const testInfoData = await readingService.getTestInfo(id!);
      setTestInfo(testInfoData);

      try {
        const metadata = await readingService.getPdfMetadata(id!);
        setPdfMetadata(metadata);
      } catch (error) {
        console.warn("Metadata fetch failed:", error);
      }

      const blob = await readingService.getPdfContent(id!);
      if (blob.type !== "application/pdf") {
        throw new Error(`Invalid PDF content type: ${blob.type}`);
      }
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error loading test content:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi tải nội dung";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const retryLoading = (): void => {
    loadTestContent();
  };

  const leaveTest = (): void => {
    navigate("/");
  };

  const goToQuestion = (questionNum: number): void => {
    if (
      testInfo &&
      questionNum >= 1 &&
      questionNum <= testInfo.totalQuestions
    ) {
      if (selectedOption) {
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion]: selectedOption,
        }));
      }
      setCurrentQuestion(questionNum);
      setSelectedOption(answers[questionNum] || "");
    }
  };

  const nextQuestion = (): void => {
    if (testInfo && currentQuestion < testInfo.totalQuestions) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = (): void => {
    if (currentQuestion > 1) {
      goToQuestion(currentQuestion - 1);
    }
  };

  const selectOption = (option: string): void => {
    setSelectedOption(option);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!testInfo) {
      setError("Không thể nộp bài: Thông tin đề thi không tồn tại");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const userAnswers: string[] = Array(testInfo.totalQuestions).fill("");
    for (let i = 1; i <= testInfo.totalQuestions; i++) {
      userAnswers[i - 1] = answers[i]?.toUpperCase() || "";
      if (
        userAnswers[i - 1] &&
        !["A", "B", "C", "D"].includes(userAnswers[i - 1])
      ) {
        setError(`Đáp án câu ${i} không hợp lệ. Vui lòng chọn A, B, C hoặc D.`);
        setLoading(false);
        return;
      }
    }

    const userJson = localStorage.getItem("user");
    let accountId: string | null = null;

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        accountId = user.id;
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setError("Lỗi đọc dữ liệu người dùng.");
        setLoading(false);
        return;
      }
    }

    if (!accountId) {
      setError("Bạn cần đăng nhập để nộp bài.");
      setLoading(false);
      return;
    }

    const startTimeAdjusted = new Date(
      Date.now() - (initialTestTimeMinutes * 60 - timeRemaining) * 1000,
    ).toISOString();

    const payload: SubmitAnswerRequest = {
      UserAnswers: userAnswers,
      AccountId: accountId,
      StartTime: startTimeAdjusted,
    };

    try {
      const result = await readingService.submitAnswers(id!, payload);
      if (!result.submissionId) {
        throw new Error("Không nhận được ID bài nộp từ server");
      }

      navigate(`/resultReading/${result.submissionId}`, {
        state: { accountId: result.accountId },
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi nộp bài";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionGrid = (): React.ReactNode[] => {
    const questions: React.ReactNode[] = [];
    if (testInfo) {
      for (let i = 1; i <= testInfo.totalQuestions; i++) {
        questions.push(
          <button
            key={i}
            className={`w-9 h-9 border border-gray-300 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
              i === currentQuestion
                ? "bg-blue-500 text-white border-blue-500"
                : answers[i]
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white"
            }`}
            onClick={() => goToQuestion(i)}
          >
            {i}
          </button>,
        );
      }
    } else {
      questions.push(
        <div key="no-questions" className="text-gray-600 text-sm">
          Chưa tải thông tin câu hỏi
        </div>,
      );
    }
    return questions;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">
              {testInfo
                ? testInfo.testTitle
                : pdfMetadata
                  ? getTestTitle(pdfMetadata.content, pdfMetadata.fileName)
                  : "Đề thi Reading"}
            </span>
          </div>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            onClick={retryLoading}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
        </div>
        <div className="flex-1 p-5 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-600 mt-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Đang tải nội dung...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 mt-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold mb-2">Lỗi tải nội dung</h3>
              <p className="mb-4">{error}</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={retryLoading}
              >
                Thử lại
              </button>
            </div>
          ) : pdfUrl ? (
            <div className="prose max-w-none">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  title="Reading Test PDF"
                  width="100%"
                  height="600"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 mt-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Chưa có nội dung</h3>
              <p className="mb-4">Nội dung PDF sẽ được tải từ server</p>
            </div>
          )}
        </div>
      </div>
      <div className="w-96 bg-white flex flex-col">
        <div className="bg-blue-500 text-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <span>Thời gian còn lại</span>
          </div>
          <div className="text-lg font-semibold">
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="p-4 bg-yellow-50 border-b border-gray-300">
          <div className="font-semibold text-red-600 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {testInfo
              ? testInfo.testTitle
              : pdfMetadata
                ? getTestTitle(pdfMetadata.content, pdfMetadata.fileName)
                : "Đang tải đề thi..."}
          </div>
          <div className="text-sm text-gray-600">
            Câu <span className="font-semibold">{currentQuestion}</span> (5
            điểm):
            <br />
            Nhập đáp án để trả lời
          </div>
        </div>
        <div className="p-4 border-b border-gray-300">
          <div className="font-semibold mb-3">Phiếu trả lời</div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {generateQuestionGrid()}
          </div>
          <input
            type="text"
            placeholder={`Đáp án câu ${currentQuestion}: A, B, C, D...`}
            className="w-full p-3 border border-gray-300 rounded-md mb-4 text-sm"
            value={selectedOption}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSelectedOption(e.target.value.toUpperCase())
            }
            maxLength={1}
          />
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(["A", "B", "C", "D"] as const).map((option: string) => (
              <button
                key={option}
                className={`p-3 border-2 font-semibold transition-all duration-200 text-center ${
                  selectedOption === option
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-b border-gray-300">
          <div className="flex gap-3 mb-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
              onClick={previousQuestion}
              disabled={currentQuestion === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              {currentQuestion - 1 || 1}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              onClick={nextQuestion}
              disabled={
                !!testInfo && currentQuestion === testInfo.totalQuestions
              }
            >
              {testInfo && currentQuestion + 1 > testInfo.totalQuestions
                ? testInfo.totalQuestions
                : currentQuestion + 1}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            <button
              className="flex-1 p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              onClick={leaveTest}
            >
              Rời khỏi
            </button>
            <button
              className="flex-1 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
          Đã trả lời: {Object.keys(answers).length}/
          {testInfo ? testInfo.totalQuestions : 0} câu
        </div>
      </div>
    </div>
  );
};

export default ReadingTestInterface;
