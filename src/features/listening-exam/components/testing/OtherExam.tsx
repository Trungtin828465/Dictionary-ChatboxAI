import TestItem from "@/features/listening-exam/components/testItem/TestItem";
import {
  ListeningExam,
  ListeningExamResponse,
} from "@/features/listening-exam/types/ListeningExam";
import { ListeningUserExam } from "@/features/listening-exam/types/UserExam";
import { useEffect, useState } from "react";
import { listeningService } from "../../api/listening-service";
import styles from "./styles.module.scss";

interface OtherExamListProps {
  otherExams: ListeningUserExam[];
}

interface ExamWithStatus {
  exam: ListeningExam;
  status: string;
}

const OtherExam = ({ otherExams }: OtherExamListProps) => {
  const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert ListeningExamResponse to ListeningExam
  const convertToListeningExam = (
    examResponse: ListeningExamResponse,
  ): ListeningExam => {
    return {
      id: examResponse.id,
      topic: examResponse.topic,
      title: examResponse.title,
      description: examResponse.description,
      skill: examResponse.skill,
      time: examResponse.time,
      numberQuestion: examResponse.questions?.length || 0,
    };
  };

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const examDetailsPromises = otherExams.map(async (userExam) => {
          try {
            const examDetails = await listeningService.getListeningExamById(
              userExam.examId,
            );
            return {
              exam: convertToListeningExam(examDetails),
              status: userExam.status,
            };
          } catch (error) {
            console.error(`Failed to fetch exam ${userExam.examId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(examDetailsPromises);
        const validResults = results.filter(
          (result) => result !== null,
        ) as ExamWithStatus[];
        setExamsWithStatus(validResults);
      } catch (error) {
        console.error("Failed to fetch exam details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [otherExams]);

  // Helper function to get colors based on exam status
  const getExamColors = (status: string) => {
    switch (status) {
      case "done":
        return {
          mainColor: "#914BFB",
          secondaryColor: "#0E8CAA",
        };
      case "doing":
        return {
          mainColor: "#FFBF47",
          secondaryColor: "#F2FF90",
        };
      default:
        return {
          mainColor: "#31e3a5",
          secondaryColor: "#1B7D5B",
        };
    }
  };

  if (loading) {
    return (
      <div className={styles.otherExams}>
        <h3 className="text-lg font-extrabold">Đề thi Listening khác</h3>
        <div className="flex justify-center p-4">
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.otherExams}>
      <h3 className="text-lg font-extrabold">Đề thi Listening khác</h3>
      <div className={styles.otherExamsList}>
        {examsWithStatus.map((examWithStatus, idx) => {
          const { mainColor, secondaryColor } = getExamColors(
            examWithStatus.status,
          );
          return (
            <TestItem
              key={idx}
              exam={examWithStatus.exam}
              mainColor={mainColor}
              secondaryColor={secondaryColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OtherExam;
