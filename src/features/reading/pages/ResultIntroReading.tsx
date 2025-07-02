import NotGoodIcon from "@/assets/icons/notGood.svg";
import WellDoneIcon from "@/assets/icons/wellDone.svg";
import { FileText, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readingService, ExamResult } from "../api/reading-service";

const ResultIntroReading = () => {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  console.log("ResultIntroReading submissionId:", submissionId);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await readingService.getExamResult(submissionId!);
        setResult(data);
      } catch (err) {
        console.error("Error fetching result:", err);
        setError("Không thể tải kết quả bài thi");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchResult();
    } else {
      setError("Không tìm thấy ID bài nộp");
      setLoading(false);
    }
  }, [submissionId]);

  const handleViewSubmission = () => {
    console.log("Navigating to:", `/review-submission/${submissionId}`);
    navigate(`/review-submission/${submissionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background bubbles */}
      <div
        className="absolute top-20 right-10 w-80 h-80 rounded-full opacity-20"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-30"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        }}
      ></div>
      <div
        className="absolute top-40 right-40 w-20 h-20 rounded-full opacity-25"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        }}
      ></div>

      {/* Breadcrumb */}
      <div className="bg-white px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a
              href="/"
              className="flex items-center gap-2 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </a>
            <span className="mx-2">›</span>
            <a href="/exams" className="hover:text-gray-700 transition-colors">
              <FileText className="w-4 h-4 inline mr-1" />
              Bộ đề thi tổng hợp
            </a>
            <span className="mx-2">›</span>
            <span className="text-[#37474F] font-bold">
              Kết quả thi thử {result?.testTitle || "Listening Exam"}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Kết quả thi thử {result?.testTitle || "Listening Exam"}
          </h2>

          {/* Character Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="img">
                {result?.score && result.score >= 60 ? (
                  <img src={WellDoneIcon} alt="wellDone" />
                ) : (
                  <img src={NotGoodIcon} alt="notGood" />
                )}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-5xl font-bold text-green-500 mb-12">
            {result?.correctAnswers} / {result?.totalQuestions} câu
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mb-12 text-left">
            <div>
              <p className="text-gray-600 mb-3">
                Số lượng câu đúng:{" "}
                <span className="font-semibold text-gray-900">
                  {result?.correctAnswers} câu
                </span>
              </p>
              <p className="text-gray-600">
                Số lượng câu sai:{" "}
                <span className="font-semibold text-gray-900">
                  {result?.wrongAnswers} câu
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-3">
                Số lượng câu chưa làm:{" "}
                <span className="font-semibold text-gray-900">
                  {result?.notAnswered} câu
                </span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <button className="px-12 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition-colors">
              Thoát
            </button>
            <button
              onClick={handleViewSubmission}
              className="px-12 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 font-medium transition-colors"
            >
              Xem bài làm
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultIntroReading;
