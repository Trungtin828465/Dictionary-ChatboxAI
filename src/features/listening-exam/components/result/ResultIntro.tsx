import HomeIcon from "@/assets/icons/home.svg";
import NotGoodIcon from "@/assets/icons/notGood.svg";
import WellDoneIcon from "@/assets/icons/wellDone.svg";
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
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listeningService } from "../../api/listening-service";
import { Result } from "../../types/Result";
import { ListeningUserExam } from "../../types/UserExam";
import OtherExam from "../testing/OtherExam";
import ResultContent from "./ResultContent";
import styles from "./styles.module.scss";
const ResultIntro = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [otherExams, setOtherExams] = useState<ListeningUserExam[]>([]);
  const [openDetailResult, setOpenDetailResult] = useState(false);

  const fetchResult = async () => {
    const result = await listeningService.getResult(id!);
    setResult(result);
  };

  const fetchOtherExams = async () => {
    const otherExams = await listeningService.getSimilarExams(id!, user?.id!);
    setOtherExams(otherExams || []);
  };

  useEffect(() => {
    if (id) {
      fetchResult();
      fetchOtherExams();
    }
  }, [id]);

  const handleNavigateToExams = () => {
    navigate("/exams");
  };

  return (
    <div className={styles.result}>
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
                Kết quả thi thử {result?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card className={styles.resultCard}>
        {openDetailResult ? (
          <ResultContent result={result!} />
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-3xl font-bold mt-8">
                Kết quả thi thử {result?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.resultCardContent}>
              <div className="img">
                {result?.overallScore ? (
                  result?.overallScore >= 5 && result?.overallScore <= 10 ? (
                    <img src={WellDoneIcon} alt="wellDone" />
                  ) : (
                    <img src={NotGoodIcon} alt="notGood" />
                  )
                ) : (
                  <img src={NotGoodIcon} alt="notGood" />
                )}
              </div>
              <div
                className={`font-bold text-[24px] ${styles.resultScore} ${
                  result?.overallScore
                    ? result?.overallScore >= 5 && result?.overallScore <= 10
                      ? "text-[#31E3A5]"
                      : "text-[#FF0000]"
                    : ""
                }`}
              >
                <p>
                  {listeningService.countCorrectAnswers(result)} /
                  <span> {result?.results?.length} câu</span>
                </p>
              </div>
              <div className={styles.resultInfoContainer}>
                <div className={styles.resultInfo}>
                  <p>
                    Số lượng câu đúng:{" "}
                    <span>
                      {result
                        ? listeningService.countCorrectAnswers(result)
                        : 0}{" "}
                      câu
                    </span>
                  </p>
                  <p>
                    Số lượng câu sai:{" "}
                    <span>
                      {result
                        ? listeningService.countIncorrectAnswers(result)
                        : 0}{" "}
                      câu
                    </span>
                  </p>
                </div>
                <div className={styles.resultInfo}>
                  <p>
                    Số lượng câu chưa làm:{" "}
                    <span>
                      {result?.results?.length
                        ? result?.results?.length -
                          listeningService.countCorrectAnswers(result) -
                          listeningService.countIncorrectAnswers(result)
                        : 0}
                      câu
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.resultButton}>
                <Button
                  className={styles.secondaryButton}
                  onClick={handleNavigateToExams}
                >
                  Thoát
                </Button>
                <Button
                  className={styles.mainButton}
                  onClick={() => setOpenDetailResult(true)}
                >
                  Xem bài làm
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
      <OtherExam otherExams={otherExams} />
    </div>
  );
};

export default ResultIntro;
