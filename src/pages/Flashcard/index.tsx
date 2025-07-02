import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./styles.module.scss";
import { api } from "@/services/api-client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import ListIcon from "@/assets/icons/flashcard.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

const API_BASE_URL = import.meta.env.VITE_BE_API_URL;
interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  type: string;
  pronunciation: string;
  meaning: string;
  vietnameseMeaning: string;
  workspaceId: string;
  isLearned: boolean;
}

export default function FlashCard() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<null | "left" | "right">(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRaw = (
    vocabularyItems[currentCardIndex]?.pronunciation || ""
  ).split("|")[1];
  const audioUrl =
    audioUrlRaw && audioUrlRaw !== "undefined" ? audioUrlRaw : "";
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null);

  const fetchVocabularyItems = async () => {
    try {
      const response = await api.get<VocabularyItem[]>(`/api/v1/Dictionary`);
      const filtered = response.filter(
        (item) => item.workspaceId === workspaceId,
      );
      setVocabularyItems(filtered);
    } catch (error) {
      console.error("Failed to fetch vocabulary items:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách từ vựng",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVocabularyItems();
  }, [workspaceId, toast]);

  useEffect(() => {
    if (!isFlipped && pendingCardIndex !== null) {
      setCurrentCardIndex(pendingCardIndex);
      setPendingCardIndex(null);
    }
  }, [isFlipped, pendingCardIndex]);

  if (!vocabularyItems || vocabularyItems.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.header}>No vocabulary items found</h1>
        <button className={styles.testButton} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const totalCards = vocabularyItems.length;
  const currentCard = vocabularyItems[currentCardIndex];

  const handleMarkAsLearned = async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}api/v1/Dictionary/${currentCard.id}/learning-status`,
        JSON.stringify(true),
        { headers: { "Content-Type": "application/json" } },
      );
      await fetchVocabularyItems();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái từ vựng",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsNotLearned = async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}api/v1/Dictionary/${currentCard.id}/learning-status`,
        JSON.stringify(false),
        { headers: { "Content-Type": "application/json" } },
      );
      await fetchVocabularyItems();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái từ vựng",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0 && !slideDirection) {
      setSlideDirection("right");
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
        setSlideDirection(null);
        setIsFlipped(false);
      }, 400); // 400ms matches CSS transition
    }
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1 && !slideDirection) {
      setSlideDirection("left");
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        setSlideDirection(null);
        setIsFlipped(false);
      }, 400); // 400ms matches CSS transition
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play();
    }
  };

  const learnedCount = vocabularyItems.filter((item) => item.isLearned).length;
  const notLearnedCount = vocabularyItems.length - learnedCount;

  return (
    <>
      <div className={styles.mapping}>
        <span className={styles.mappingItem} onClick={() => navigate("/")}>
          <span className={styles.homeIcon}>🏠</span> Trang chủ
        </span>
        <span className={styles.mappingDivider}>/</span>
        <span
          className={styles.mappingItem}
          onClick={() => navigate("/my-vocab")}
        >
          Từ vựng của tôi
        </span>
        <span className={styles.mappingDivider}>/</span>
        <span className={styles.mappingCurrent}>Danh sách từ vựng</span>
      </div>
      <div className={styles.pageTitle}>
        <img
          src={ArrowLeftIcon}
          alt="arrow left"
          className={styles.breadcrumbArrow}
          onClick={() => navigate("/my-vocab")}
        />
        <span>Học từ vựng cùng Flashcards</span>
      </div>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.title}>
              <img
                src={ListIcon}
                alt="list icon"
                className={styles.titleIcon}
              />
              Danh sách từ vựng của tôi
            </div>
            <div className={styles.stats}>
              <span>{totalCards} từ</span>
              <span className={styles.dot}>•</span>
              <span>{learnedCount} Đã học</span>
              <span className={styles.dot}>•</span>
              <span>{notLearnedCount} Chưa học</span>
            </div>
          </div>
          <button
            className={styles.testButton}
            onClick={() => navigate(`/test/${workspaceId}`)}
          >
            Kiểm tra ngay
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressText}>
            {currentCardIndex + 1}/{totalCards} từ
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div className={styles.cardContainer}>
          <button
            className={styles.rectButton + " " + styles.left}
            onClick={handlePrev}
            disabled={currentCardIndex === 0 || !!slideDirection}
          >
            <span className={styles.arrowIcon}>←</span>
          </button>
          <div
            className={
              `${styles.card} ${isFlipped ? styles.flipped : ""} ` +
              (currentCard.isLearned ? styles.learned : "") +
              (slideDirection === "left" ? " " + styles.slideLeft : "") +
              (slideDirection === "right" ? " " + styles.slideRight : "")
            }
            onClick={() => !slideDirection && setIsFlipped(!isFlipped)}
          >
            <div className={styles.cardFront}>
              <h2>{currentCard?.word}</h2>
              <p className={styles.pronunciation}>
                {(currentCard?.pronunciation || "").split("|")[0]}
              </p>
              <div className={styles.instructionBar}>
                Click chuột để lật thẻ này{" "}
                <span role="img" aria-label="hand">
                  👆
                </span>
              </div>
            </div>
            <div className={styles.cardBack}>
              <div className={styles.meaningBlock}>
                <div className={styles.vietnamese}>
                  {currentCard?.vietnameseMeaning}
                </div>
                <div className={styles.pronunciation}>
                  {(currentCard?.pronunciation || "").split("|")[0]}
                </div>
              </div>
              <div className={styles.instructionBar}>
                Click chuột để lật thẻ này{" "}
                <span role="img" aria-label="hand">
                  👆
                </span>
              </div>
            </div>
          </div>
          <button
            className={styles.rectButton + " " + styles.right}
            onClick={handleNext}
            disabled={currentCardIndex === totalCards - 1 || !!slideDirection}
          >
            <span className={styles.arrowIcon}>→</span>
          </button>
        </div>
        <div className={styles.controls}>
          <button
            onClick={handleMarkAsLearned}
            className={`${styles.controlButton} ${
              currentCard.isLearned ? styles.learnedButton : ""
            }`}
            disabled={currentCard.isLearned}
          >
            Đã học từ này
          </button>
          <button
            onClick={handleMarkAsNotLearned}
            className={styles.controlButton}
            disabled={!currentCard.isLearned}
          >
            Học lại từ này
          </button>
          <button
            onClick={handlePlayAudio}
            className={styles.controlButton}
            disabled={!audioUrl}
          >
            Phát âm <span className={styles.speakerIcon}>🔊</span>
          </button>
        </div>
      </div>
    </>
  );
}
