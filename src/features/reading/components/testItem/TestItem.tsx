import CircleIcon from "@/assets/icons/circle.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style.module.scss";

// Embedded interfaces
interface PdfDocument {
  id: number;
  fileName: string | null;
  content: string | null;
  uploadDate: string;
  fileSize: number | null;
  fileData: string | null;
  examId: string;
}

interface TestInfo {
  idPdf: number;
  testTitle: string;
  totalQuestions: number;
}

interface Exam {
  id: string; // Guid
  name: string;
  topicId: string;
  time: number;
  skill: string;
  createdAt: string;
  updatedAt: string | null;
  topic?: {
    id: string;
    name: string;
  };
}

interface TestItemProps {
  mainColor: string;
  secondaryColor: string;
  exam: Exam;
}

const TestItem = ({ exam, mainColor, secondaryColor }: TestItemProps) => {
  const BASE_URL = import.meta.env.VITE_BE_API_URL;
  const gradient = `linear-gradient(90deg, ${mainColor} 0%, ${secondaryColor} 100%)`;
  const navigate = useNavigate();
  const [pdfDocuments, setPdfDocuments] = useState<PdfDocument[]>([]);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      console.log("Using token:", token ? "Token present" : "No token");

      try {
        console.log("Fetching PDFs for Exam ID:", exam.id);
        const pdfResponse = await fetch(`${BASE_URL}api/Pdf/exam/${exam.id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!pdfResponse.ok) {
          const errorText = await pdfResponse.text();
          throw new Error(
            `Failed to fetch PDFs: ${pdfResponse.status} - ${errorText || pdfResponse.statusText}`,
          );
        }
        const pdfData: PdfDocument[] = await pdfResponse.json();
        console.log("Fetched PDFs:", pdfData);
        setPdfDocuments(pdfData);

        if (pdfData.length === 0) {
          console.warn("No PDFs found for Exam ID:", exam.id);
          setError("Không tìm thấy tài liệu PDF cho đề thi này.");
          return;
        }

        console.log("Fetching Test Info for Pdf ID:", pdfData[0].id);
        const testInfoResponse = await fetch(
          `${BASE_URL}api/user/UserAnswer/reading/info/${pdfData[0].id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        if (!testInfoResponse.ok) {
          const errorText = await testInfoResponse.text();
          throw new Error(
            `Failed to fetch test info: ${testInfoResponse.status} - ${errorText || testInfoResponse.statusText}`,
          );
        }
        const testInfoData: TestInfo = await testInfoResponse.json();
        console.log("Fetched Test Info:", testInfoData);
        setTestInfo(testInfoData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [exam.id]);

  const handleStartExam = () => {
    if (!exam.id) {
      console.error("Invalid exam ID:", exam);
      alert("Đề thi không hợp lệ.");
      return;
    }
    if (!pdfDocuments || pdfDocuments.length === 0) {
      console.error("No PDF documents found for exam:", exam);
      alert(
        "Không tìm thấy tài liệu PDF cho đề thi này. Vui lòng kiểm tra Exam ID: " +
          exam.id,
      );
      return;
    }
    const pdfId = pdfDocuments[0].id;
    console.log("Navigating to:", `/reading-test/${pdfId}`);
    navigate(`/reading-test/${pdfId}`);
  };

  return (
    <div className={styles.testCard}>
      <div className={styles.testCardHeader}>
        <div
          style={{
            width: "30px",
            height: "30px",
            background: gradient,
            position: "relative",
          }}
        >
          <img src={CircleIcon} alt="circle" className={styles.circleIcon} />
        </div>
        <h4 className="font-medium">{exam.name}</h4>
      </div>
      <div className={styles.testCardQuestion}>
        <img src={QuestionIcon} alt="question" />
        <p>
          {loading ? "Đang tải..." : testInfo ? testInfo.totalQuestions : "0"}{" "}
          câu hỏi
        </p>
      </div>
      <div className={styles.testCardTopic}>
        <p>
          Chủ đề: <span>{exam.topic?.name || "Không xác định"}</span>
        </p>
      </div>
      <div
        style={{
          width: "max-content",
          background: gradient,
          borderRadius: "8px",
          padding: "0.5rem 1rem",
          color: "#fff",
          fontWeight: "bold",
          display: "inline-block",
        }}
      >
        <p className="text-[12px]">
          <span>Đề mới</span>
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className="text-[13px] font-medium hover:border-1 hover:border-[#000]"
        onClick={handleStartExam}
        disabled={loading}
      >
        {loading ? "Đang tải..." : "Bắt đầu ngay"}
      </button>
    </div>
  );
};

export default TestItem;
