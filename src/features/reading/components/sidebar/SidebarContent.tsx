import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { readingService, Topic, Exam } from "../../api/reading-service";
import styles from "../style.module.scss";
import EXAMS from "@/assets/icons/exams.svg?react";
import { useNavigate } from "react-router-dom";
import { Band } from "../../Types/Bands";
import QuestionIcon from "@/assets/icons/question.svg";

interface SidebarContentProps {
  activeBand: Band;
  description: string;
  selectedTopic: Topic | null;
}

// Define interface for the reading info API response
interface ReadingInfo {
  idPdf: number;
  testTitle: string;
  totalQuestions: number;
}

const SidebarContent = ({ activeBand, selectedTopic }: SidebarContentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examsToDisplay, setExamsToDisplay] = useState<Exam[]>([]); // Exams for selected topic or all exams for active band
  const [examsByTopic, setExamsByTopic] = useState<{
    [topicId: string]: Exam[];
  }>({}); // Store all exams for active band, grouped by topic
  const [examDetails, setExamDetails] = useState<{
    [key: string]: ReadingInfo;
  }>({}); // Store reading info for all relevant exams
  const BASE_URL = import.meta.env.VITE_BE_API_URL;

  const [topics, setTopics] = useState<Topic[]>([]); // Store topics for active band
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      setExamsToDisplay([]);
      setExamsByTopic({});
      setExamDetails({});
      setTopics([]);

      if (activeBand) {
        try {
          if (selectedTopic) {
            // Case 2: Specific topic is selected - fetch exams for that topic only
            const fetchedExams = await readingService.getExamsByTopicId(
              selectedTopic.id,
            );
            setExamsToDisplay(fetchedExams);

            const details: { [key: string]: ReadingInfo } = {};
            for (const exam of fetchedExams) {
              if (exam.pdfDocuments && exam.pdfDocuments.length > 0) {
                const readingInfo = await fetchReadingInfo(
                  exam.pdfDocuments[0].id,
                );
                if (readingInfo) {
                  details[exam.id] = readingInfo;
                }
              }
            }
            setExamDetails(details);
          } else {
            // Case 1: No specific topic is selected - fetch all exams for the active band, grouped by topic
            const fetchedTopics = await readingService.getTopicsByProficiencyId(
              activeBand.id,
            );
            setTopics(fetchedTopics);

            const allExams: { [topicId: string]: Exam[] } = {};
            const allExamDetails: { [key: string]: ReadingInfo } = {};

            for (const topic of fetchedTopics) {
              const examsForTopic = await readingService.getExamsByTopicId(
                topic.id,
              );
              allExams[topic.id] = examsForTopic;

              for (const exam of examsForTopic) {
                if (exam.pdfDocuments && exam.pdfDocuments.length > 0) {
                  const readingInfo = await fetchReadingInfo(
                    exam.pdfDocuments[0].id,
                  );
                  if (readingInfo) {
                    allExamDetails[exam.id] = readingInfo;
                  }
                }
              }
            }
            setExamsByTopic(allExams);
            setExamDetails(allExamDetails);
          }
        } catch (err) {
          setError(
            "Không thể tải nội dung. Vui lòng kiểm tra lại API hoặc kết nối mạng.",
          );
        } finally {
          setLoading(false);
        }
      }
    };
    fetchContent();
  }, [activeBand, selectedTopic]); // Depend on both activeBand and selectedTopic

  const fetchReadingInfo = async (pdfId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}api/user/UserAnswer/reading/info/${pdfId}`,
      );
      if (!response.ok) {
        throw new Error(
          `Lỗi khi tải thông tin đề thi: ${response.status} ${response.statusText}`,
        );
      }
      const data: ReadingInfo = await response.json();
      return data;
    } catch (err) {
      console.error(`Lỗi khi tải thông tin cho pdfId ${pdfId}:`, err);
      return null;
    }
  };

  const handleStartExam = (exam: Exam) => {
    if (exam.pdfDocuments && exam.pdfDocuments.length > 0) {
      navigate(`/reading-test/${exam.pdfDocuments[0].id}`, {
        state: {
          time: exam.time,
          totalQuestions: examDetails[exam.id]?.totalQuestions,
        },
      });
    }
  };

  return (
    <div className={styles.readingContent}>
      <div className={styles.readingContentHeader}>
        <h2 className="text-xl font-bold mb-2">{activeBand?.name}</h2>
        <p className={styles.description}>{activeBand?.description}</p>
      </div>
      <div className={styles.readingContentBody}>
        <h3 className="text-lg font-extrabold mb-2">Luyện đề ngay</h3>
        {loading ? (
          <div className="w-full text-center py-10">Đang tải nội dung...</div>
        ) : error ? (
          <div className="w-full text-center text-red-500 py-10">{error}</div>
        ) : // Render based on whether a topic is selected
        selectedTopic ? (
          // Case 2: Specific topic selected - display exams for that topic
          examsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 w-full">
              {examsToDisplay.map((exam) => (
                <Card
                  key={exam.id}
                  className={styles.examCard}
                  onClick={() => handleStartExam(exam)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.examCardHeader}>
                    <span className={styles.examIcon}>
                      <EXAMS />
                    </span>
                    <h4>{exam.name}</h4>
                  </div>
                  <div className={styles.examInfo}>
                    <img src={QuestionIcon} alt="question" />
                    {examDetails[exam.id]?.totalQuestions ? (
                      <p>{examDetails[exam.id].totalQuestions} câu hỏi</p>
                    ) : (
                      <span>? Đang tải số câu hỏi...</span>
                    )}
                    {exam.time && <span>⏱️ {exam.time} phút</span>}
                  </div>
                  <div className={styles.examTopic}>
                    Kỹ năng: <span>{exam.skill}</span>
                  </div>
                  {exam.pdfDocuments.length > 0 && (
                    <div className={styles.examBadge}>Chủ đề: {exam.name}</div>
                  )}
                  <button
                    className={styles.examStartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartExam(exam);
                    }}
                  >
                    Bắt đầu ngay
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-10 text-gray-500">
              Chưa có đề thi nào cho topic đã chọn.
            </div>
          )
        ) : // Case 1: No specific topic selected - display all exams for the active band, grouped by topic
        topics.length > 0 ? (
          <div>
            {topics.map((topic) => (
              <div key={topic.id} className="mb-6">
                <h4 className="text-lg font-semibold mb-3">{topic.name}</h4>
                {examsByTopic[topic.id] && examsByTopic[topic.id].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 w-full">
                    {examsByTopic[topic.id].map((exam) => (
                      <Card
                        key={exam.id}
                        className={styles.examCard}
                        onClick={() => handleStartExam(exam)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.examCardHeader}>
                          <span className={styles.examIcon}>
                            <EXAMS />
                          </span>
                          <h4>{exam.name}</h4>
                        </div>
                        <div className={styles.examInfo}>
                          <img src={QuestionIcon} alt="question" />
                          {examDetails[exam.id]?.totalQuestions ? (
                            <p>{examDetails[exam.id].totalQuestions} câu hỏi</p>
                          ) : (
                            <span>? Đang tải số câu hỏi...</span>
                          )}
                          {exam.time && <span>⏱️ {exam.time} phút</span>}
                        </div>
                        <div className={styles.examTopic}>
                          Kỹ năng: <span>{exam.skill}</span>
                        </div>
                        {exam.pdfDocuments.length > 0 && (
                          <div className={styles.examBadge}>
                            Chủ đề: {exam.name}
                          </div>
                        )}
                        <button
                          className={styles.examStartBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartExam(exam);
                          }}
                        >
                          Bắt đầu ngay
                        </button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Chưa có đề thi nào cho topic này.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-10 text-gray-500">
            Chọn một topic từ menu bên trái để xem danh sách đề thi.
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContent;
