import { Spinner } from "@/components/Spinner";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { listeningService } from "../../api/listening-service";
import { Band } from "../../types/Bands";
import { ListeningExam } from "../../types/ListeningExam";
import { UserExamList } from "../../types/UserExam";
import styles from "../style.module.scss";
import TestItem from "../testItem/TestItem";
import { useAuth } from "@/contexts/auth-context";

interface SidebarContentProps {
  activeBand: Band;
  description: string;
}

const SidebarContent = ({ activeBand }: SidebarContentProps) => {
  const { user } = useAuth();
  const [examList, setExamList] = useState<ListeningExam[]>([]);
  const [userExamList, setUserExamList] = useState<UserExamList>();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exam list when selected topic changes
  const fetchExamList = async (proficiencyId: string) => {
    if (!proficiencyId) return;

    setIsLoading(true);
    try {
      const examList =
        await listeningService.getListeningExamList(proficiencyId);
      setExamList(examList);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      setExamList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user exam list
  const fetchUserExamList = async (userId: string) => {
    try {
      const userExamList = await listeningService.getUserExam(userId);
      setUserExamList(userExamList);
    } catch (error) {
      console.error("Failed to fetch user exam list:", error);
      setUserExamList({ user_id: userId, data: [] });
    }
  };

  useEffect(() => {
    if (!activeBand) return;
    fetchExamList(activeBand.id);
    if (user?.id) {
      fetchUserExamList(user.id);
    }
  }, [activeBand, user?.id]);

  // Helper function to get colors based on exam status
  const getExamColors = (examId: string) => {
    const userExam = userExamList?.data.find(
      (userExam) => userExam.examId === examId,
    );

    if (!userExam) {
      // Exam is in examList but not in userExam
      return {
        mainColor: "#31e3a5",
        secondaryColor: "#1B7D5B",
      };
    }

    switch (userExam.status) {
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
        // Fallback for any other status
        return {
          mainColor: "#31e3a5",
          secondaryColor: "#1B7D5B",
        };
    }
  };

  return (
    <div className={styles.listeningContent}>
      <div className={styles.listeningContentHeader}>
        <h2 className="text-xl font-bold mb-2">{activeBand?.name}</h2>
        <p className={styles.description}>{activeBand?.description}</p>
      </div>

      <div className={styles.listeningContentBody}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-extrabold">Luyện đề ngay</h3>
        </div>

        {isLoading ? (
          <Spinner />
        ) : examList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {examList.map((exam, idx) => {
              const { mainColor, secondaryColor } = getExamColors(exam.id);
              return (
                <TestItem
                  key={idx}
                  exam={exam}
                  mainColor={mainColor}
                  secondaryColor={secondaryColor}
                />
              );
            })}
          </div>
        ) : (
          <Card className="flex gap-2 flex-col justify-center items-center h-[50vh]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
              className="size-10 text-[#37474F]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
              />
            </svg>
            <p className="text-sm text-[#37474F]">Chưa có đề thi nào</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SidebarContent;
