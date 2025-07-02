import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Home,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { readingService, AnswerCheckResponse } from "../api/reading-service";

const SubmissionDetails: React.FC = () => {
  const submissionId = window.location.pathname.split("/").pop() || "0";
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState<AnswerCheckResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const correctAnswers =
    reviewData?.results?.filter((detail) => detail.isCorrect).length || 0;
  const incorrectAnswers =
    reviewData?.results?.filter(
      (detail) =>
        !detail.isCorrect &&
        detail.userAnswer !== null &&
        detail.userAnswer !== undefined &&
        detail.userAnswer !== "",
    ).length || 0;
  const notAnswered = reviewData?.totalQuestions
    ? reviewData.totalQuestions - (correctAnswers + incorrectAnswers)
    : 0;

  const scorePercentage =
    reviewData?.totalQuestions && reviewData.totalQuestions > 0
      ? Math.round((correctAnswers / reviewData.totalQuestions) * 100)
      : 0;

  const timeTakenSeconds = reviewData?.timeTakenSeconds || 0;
  const hours = Math.floor(timeTakenSeconds / 3600);
  const minutes = Math.floor((timeTakenSeconds % 3600) / 60);
  const seconds = timeTakenSeconds % 60;

  const loadPdf = async (pdfId: number) => {
    try {
      const blob = await readingService.getPdfContent(pdfId);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(`${url}#toolbar=0`);
    } catch (err) {
      console.error("Lỗi khi tải PDF:", err);
      setError(err instanceof Error ? err.message : "Không thể tải PDF.");
    }
  };

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      setError("");

      const parsedSubmissionId = parseInt(submissionId, 10);
      if (isNaN(parsedSubmissionId) || parsedSubmissionId <= 0) {
        setError("ID bài nộp không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        const data =
          await readingService.getSubmissionReview(parsedSubmissionId);
        setReviewData(data);

        if (data.pdfId) {
          await loadPdf(data.pdfId);
        } else {
          setError("Không tìm thấy ID tài liệu PDF.");
          setPdfUrl(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [submissionId]);

  const handleBackToHome = () => {
    if (window.confirm("Bạn có chắc muốn rời khỏi trang chi tiết bài làm?")) {
      navigate("/");
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError("");

    const parsedSubmissionId = parseInt(submissionId, 10);
    if (isNaN(parsedSubmissionId) || parsedSubmissionId <= 0) {
      setError("ID bài nộp không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const data = await readingService.getSubmissionReview(parsedSubmissionId);
      setReviewData(data);

      if (data.pdfId) {
        await loadPdf(data.pdfId);
      } else {
        setError("Không tìm thấy ID tài liệu PDF.");
        setPdfUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    if (window.confirm("Bạn có chắc muốn thoát?")) {
      navigate("/");
    }
  };

  const handleRedo = () => {
    if (window.confirm("Bạn có chắc muốn làm lại bài kiểm tra này?")) {
      if (reviewData && reviewData.pdfId) {
        navigate(`/reading-test/${reviewData.pdfId}`);
      } else {
        setError("Không tìm thấy pdfId để làm lại bài kiểm tra.");
      }
    }
  };

  const handleQuestionClick = (index: number) => {
    if (
      reviewData?.results &&
      index >= 0 &&
      index < reviewData.results.length
    ) {
      setCurrentQuestion(index);
    }
  };

  const isValidAnswer = (answer: string | null | undefined) => {
    return (
      answer !== null &&
      answer !== undefined &&
      answer.trim() !== "" &&
      !["[", "]", '"', ","].includes(answer.trim())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Chi tiết bài làm
                </h1>
                <p className="text-sm text-gray-500">
                  Xem lại kết quả và đáp án chi tiết
                </p>
              </div>
            </div>
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Content Flex Container */}
        {/* Using flex for equal columns */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
          {" "}
          {/* flex container with height and gap */}
          {/* Left Panel (PDF Viewer) - Equal width, full height, internal scrolling */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            {" "}
            {/* flex-1 for equal width, h-full for height, overflow-hidden and flex-col for internal layout */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
              {" "}
              {/* Fixed header */}
              <h3 className="font-medium text-gray-900">Tài liệu tham khảo</h3>
            </div>
            {/* Content area for PDF, loading, error - Scrollable */}
            <div className="flex-grow overflow-y-auto h-0 min-h-0">
              {" "}
              {/* flex-grow for remaining space, overflow-y-auto for scrolling */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Đang tải tài liệu...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Không thể tải tài liệu
                    </h4>
                    <p className="text-gray-600 mb-4">{error}</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Thử lại</span>
                  </button>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="Review PDF"
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  className="pdf-iframe"
                />
              ) : (
                <div className="h-96 bg-gray-50 flex items-center justify-center border-dashed border-2 border-gray-300 m-4 rounded-lg">
                  <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Tài liệu sẽ được hiển thị tại đây</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Right Panel - Equal width, full height, with internal scrollable content */}
          <div className="flex-1 h-full flex flex-col">
            {" "}
            {/* flex-1 for equal width, h-full for height, flex-col for internal layout */}
            {/* Content area for right panel - Scrollable */}
            <div className="space-y-6 flex-grow h-0 overflow-y-auto">
              {" "}
              {/* flex-grow and overflow-y-auto for scrolling, h-0 for flex behavior */}
              {/* Thời gian làm bài */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {" "}
                {/* Removed overflow-y-auto from here */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thời gian làm bài
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {String(hours).padStart(2, "0")}
                    </div>
                    <div className="text-sm text-gray-500">Giờ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {String(minutes).padStart(2, "0")}
                    </div>
                    <div className="text-sm text-gray-500">Phút</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {String(seconds).padStart(2, "0")}
                    </div>
                    <div className="text-sm text-gray-500">Giây</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh sách đáp án
                </h3>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Câu trả lời đúng</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-700">Câu trả lời sai</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-gray-700">Câu chưa điền đáp án</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  {reviewData?.results?.map((result, index) => (
                    <div
                      key={result.questionNumber}
                      onClick={() => handleQuestionClick(index)}
                      className={`
                                                w-10 h-10 rounded flex items-center justify-center text-sm font-medium text-white cursor-pointer
                                                ${
                                                  result.isCorrect
                                                    ? "bg-green-500"
                                                    : isValidAnswer(
                                                          result.userAnswer,
                                                        )
                                                      ? "bg-red-500"
                                                      : "bg-gray-300"
                                                }
                                                ${currentQuestion === index ? "ring-2 ring-blue-500" : ""}
                                            `}
                    >
                      {result.questionNumber}
                    </div>
                  ))}
                </div>

                {reviewData?.results &&
                  reviewData.results.length > 0 &&
                  currentQuestion >= 0 &&
                  currentQuestion < reviewData.results.length && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          Câu{" "}
                          {reviewData.results[currentQuestion].questionNumber}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reviewData.results[currentQuestion].isCorrect
                              ? "bg-green-100 text-green-800"
                              : isValidAnswer(
                                    reviewData.results[currentQuestion]
                                      .userAnswer,
                                  )
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-300 text-gray-800"
                          }`}
                        >
                          {reviewData.results[currentQuestion].isCorrect
                            ? "✓ Đúng"
                            : isValidAnswer(
                                  reviewData.results[currentQuestion]
                                    .userAnswer,
                                )
                              ? "✗ Sai"
                              : "Chưa trả lời"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Đáp án của bạn:</span>
                          <span className="font-medium text-gray-900">
                            {isValidAnswer(
                              reviewData.results[currentQuestion].userAnswer,
                            )
                              ? reviewData.results[currentQuestion].userAnswer
                              : "Không trả lời"}
                          </span>
                        </div>
                        {!reviewData.results[currentQuestion].isCorrect && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-500">Đáp án đúng:</span>
                            <span className="font-medium text-green-600">
                              {
                                reviewData.results[currentQuestion]
                                  .correctAnswer
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                {(!reviewData ||
                  !reviewData.results ||
                  reviewData.results.length === 0) &&
                  !loading &&
                  !error && (
                    <div className="text-center text-gray-500">
                      <p>Không có chi tiết đáp án để hiển thị.</p>
                    </div>
                  )}
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tổng kết
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng số câu:</span>
                    <span className="font-semibold text-gray-900">
                      {reviewData?.totalQuestions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Câu đúng:</span>
                    <span className="font-semibold text-green-600">
                      {correctAnswers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Câu sai:</span>
                    <span className="font-semibold text-red-600">
                      {incorrectAnswers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Câu chưa điền đáp án:</span>
                    <span className="font-semibold text-gray-500">
                      {notAnswered}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Điểm số:</span>
                      <span
                        className={`text-2xl font-bold ${
                          scorePercentage >= 80
                            ? "text-green-600"
                            : scorePercentage >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {scorePercentage}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleExit}
                  className="px-6 py-2 border border-gray-400 text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Thoát
                </button>
                <button
                  onClick={handleRedo}
                  className="px-6 py-2 bg-teal-400 text-white rounded-full hover:bg-teal-500 transition-colors"
                >
                  Làm lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .pdf-iframe::-webkit-scrollbar {
                    display: none;
                }
                .pdf-iframe {
                    overflow: hidden;
                }
            `}</style>
    </div>
  );
};

export default SubmissionDetails;
