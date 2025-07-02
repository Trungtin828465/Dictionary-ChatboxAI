import HomeIcon from "@/assets/icons/home.svg";
import TestingIcon from "@/assets/icons/testing.svg";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listeningService } from "@/features/listening-exam/api/listening-service";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OtherExam from "./OtherExam";
import styles from "./styles.module.scss";
import TestingContent from "./TestingContent";
import { ListeningExamResponse } from "../../types/ListeningExam";
import { Spinner } from "@/components/Spinner";
import { ListeningUserExam } from "../../types/UserExam";
import { useAuth } from "@/contexts/auth-context";

const TestingIntro = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<ListeningExamResponse | null>(null);
  const [otherExams, setOtherExams] = useState<ListeningUserExam[]>([]);
  const [openTesting, setOpenTesting] = useState(false);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenTesting = () => {
    setOpenTesting(true);
  };

  const fetchExam = async () => {
    const exam = await listeningService.getListeningExamById(id!);
    setExam(exam);
  };

  const fetchOtherExams = async () => {
    if (!user) return;
    const otherExams = await listeningService.getSimilarExams(id!, user?.id!);
    setOtherExams(otherExams || []);
  };

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      fetchExam();
      fetchOtherExams();
    }
    setIsLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (exam) {
      // Set initial time from exam (assuming exam.time is in minutes)
      setHour(Math.floor(exam.time / 60));
      setMinute(exam.time % 60);
      setSecond(0);
    }
  }, [exam]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecond((prevSecond) => {
          if (prevSecond > 0) return prevSecond - 1;
          setMinute((prevMinute) => {
            if (prevMinute > 0) {
              setSecond(59);
              return prevMinute - 1;
            }
            setHour((prevHour) => {
              if (prevHour > 0) {
                setMinute(59);
                setSecond(59);
                return prevHour - 1;
              }
              // Time's up
              setIsRunning(false);
              return 0;
            });
            return 0;
          });
          return 0;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handlePlay = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);

  return (
    <div className={styles.testing}>
      <div className={styles.breadcrumb}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-2">
                <img src={HomeIcon} alt="home" /> Trang chủ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/exams">Bộ đề thi tổng hợp </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#37474F] font-bold">
                {exam?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className={styles.examCard}>
        {openTesting ? (
          <TestingContent
            exam={exam!}
            hour={hour}
            minute={minute}
            second={second}
            handlePlay={handlePlay}
            handleStop={handleStop}
            setExam={setExam}
          />
        ) : isLoading ? (
          <Spinner />
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-3xl font-bold mt-8">
                Làm bài kiểm tra: {exam?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.examCardContent}>
              <div className="img">
                <img src={TestingIcon} alt="testing" />
              </div>
              <div className={styles.examInfoContainer}>
                <div className={styles.examInfo}>
                  <p>
                    Mức độ: <span>{exam?.topic.name}</span>
                  </p>
                  <p>
                    Thời gian làm bài: <span>{exam?.time.toString()} phút</span>
                  </p>
                </div>
                <div className={styles.examInfo}>
                  <p>
                    Số lượng câu hỏi: <span>{exam?.questions.length} câu</span>
                  </p>

                  <p>
                    Kỹ năng: <span>{exam?.skill || "Listening"}</span>
                  </p>
                </div>
              </div>

              <Button
                className={styles.TestButton}
                onClick={() => {
                  handleOpenTesting();
                  handlePlay();
                }}
              >
                Bắt đầu làm bài
              </Button>
            </CardContent>
          </>
        )}
      </Card>
      <OtherExam otherExams={otherExams} />
    </div>
  );
};

export default TestingIntro;
