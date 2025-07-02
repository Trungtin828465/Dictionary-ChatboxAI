import AudioIcon from "@/assets/icons/audio.svg";
import PauseIcon from "@/assets/icons/PauseIcon.svg";
import PlayIcon from "@/assets/icons/PlayIcon.svg";
import Answer from "@/components/Answer/Answer";
import TimeAndAnwers from "@/components/TimeAndAnwser/TimeAndAnwers";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listeningService } from "../../api/listening-service";
import { Answers } from "../../types/Answer";
import { ListeningExamResponse } from "../../types/ListeningExam";
import {
  BackendResultResponse,
  ResultRequest,
  sortOptionsBySymbol,
  UserAnswer,
} from "../../types/Result";
import Notification from "./Notification";
import styles from "./styles.module.scss";

interface TestingContentProps {
  exam: ListeningExamResponse;
  hour: number;
  minute: number;
  second: number;
  handlePlay: () => void;
  handleStop: () => void;
  setExam: (exam: ListeningExamResponse) => void;
}

const TestingContent = ({
  exam,
  hour,
  minute,
  second,
  handlePlay,
  handleStop,
  setExam,
}: TestingContentProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ListOfAnswers, setListOfAnswers] = useState<Answers[]>([]);
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true); // Start as true, set to false when user chooses any answer

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  // Audio state management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  // Create refs for parent handlers to avoid dependency issues
  const handlePlayRef = useRef(handlePlay);
  const handleStopRef = useRef(handleStop);

  // Update refs when props change
  useEffect(() => {
    handlePlayRef.current = handlePlay;
    handleStopRef.current = handleStop;
  }, [handlePlay, handleStop]);

  // Ensure question is in ListOfAnswers
  const ensureQuestionInList = (questionId: string) => {
    if (!ListOfAnswers.some((a) => a.questionId === questionId)) {
      setListOfAnswers((prev) => [
        ...prev,
        { questionId, answer: "", isMarked: false },
      ]);
    }
  };

  const handleMarkToReview = (questionId: string) => {
    ensureQuestionInList(questionId);
    setListOfAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, isMarked: !answer.isMarked }
          : answer,
      ),
    );
  };

  // Handler to set current index and scroll carousel
  const handleChecklistClick = (index: number) => {
    setCurrentIndex(index);
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  // Add these new handlers for next/previous navigation
  const handlePrevious = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  };

  // Handle input change and set the value to the answer in ListOfAnswers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setIsEmpty(false); // User has started answering
    setListOfAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === exam.questions[currentIndex].id
          ? { ...answer, answer: value }
          : answer,
      ),
    );
  };

  const handleExitTesting = () => {
    // Pause audio when exiting
    if (audioRef && isPlaying) {
      handleAudioPause();
    }
    setIsOpenDialog(false);
    navigate("/exams");
  };

  const handleViewResult = () => {
    if (resultId) {
      navigate(`/result/${resultId}`);
    } else {
      // Fallback to exam ID if result ID is not available
      navigate(`/result/${exam.id}`);
    }
  };

  const convertTimeToMinutes = (
    hours: number,
    minutes: number,
    seconds: number,
  ) => {
    return hours * 60 + minutes + seconds / 60;
  };

  const getFinishedTime = () => {
    const remainingTimeInMinutes = convertTimeToMinutes(hour, minute, second);

    // Debug logs to understand the values
    console.log("Debug getFinishedTime:", {
      examTime: exam.time,
      hour,
      minute,
      second,
      remainingTimeInMinutes,
    });

    // Calculate elapsed time (time taken so far)
    const elapsedTime = exam.time - remainingTimeInMinutes;
    console.log("Elapsed time (finished time):", elapsedTime);

    // Safeguard: ensure elapsed time is not negative and not greater than exam time
    const safeElapsedTime = Math.max(0, Math.min(elapsedTime, exam.time));
    console.log("Safe elapsed time:", safeElapsedTime);

    return safeElapsedTime;
  };

  const handleOpenDialog = async () => {
    console.log(ListOfAnswers);
    setIsOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Pause audio during submission
      if (audioRef && isPlaying) {
        handleAudioPause();
      }

      const finishedTime = getFinishedTime();

      const isValidGuid = (str: string): boolean => {
        const guidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(str);
      };
      const validAnswers: UserAnswer[] = ListOfAnswers.filter(
        (answer) =>
          answer.answer &&
          answer.answer.trim() !== "" &&
          isValidGuid(answer.answer),
      ).map((answer) => ({
        questionId: answer.questionId,
        answerId: answer.answer!,
        isMarked: answer.isMarked || false,
      }));

      const result: ResultRequest = {
        userId: user?.id || "",
        examId: exam.id,
        finishedTime: finishedTime,
        status: "done",
        userAnswers: validAnswers,
      };

      const backendResponse: BackendResultResponse =
        await listeningService.postResult(result, "done");

      if (backendResponse) {
        // Store the result ID for navigation
        setResultId(backendResponse.id);
        console.log("backendResponse.id", backendResponse.id);
        setIsSubmitting(false);
        setIsSubmittingSuccess(true);
        await new Promise((res) => setTimeout(res, 3000));
      }
    } catch (error) {
      console.log("error", error);
      setIsSubmitting(false);
      setIsSubmittingSuccess(false);
    }
  };

  // Audio control functions
  const handleAudioPlay = () => {
    if (audioRef && !audioLoading && !audioError) {
      // Optimistic update for immediate UI feedback
      setIsPlaying(true);

      audioRef
        .play()
        .then(() => {
          console.log("Audio started playing");
          handlePlayRef.current(); // Call parent's handlePlay via ref
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setAudioError("Failed to play audio");
          setIsPlaying(false); // Revert optimistic update on error
        });
    }
  };

  const handleAudioPause = () => {
    if (audioRef) {
      // Optimistic update for immediate UI feedback
      setIsPlaying(false);

      audioRef.pause();
      console.log("Audio paused");
      handleStopRef.current(); // Call parent's handleStop via ref
    }
  };

  const handleAudioRetry = () => {
    if (exam.audioUrl && audioError) {
      console.log("Retrying audio load...");
      setAudioError(null);
      setAudioLoading(true);

      // Force a re-initialization by updating a dependency
      if (audioRef) {
        audioRef.src = "";
        audioRef.load();
      }

      // The useEffect will handle creating a new audio element
      const audio = new Audio();
      audio.src = exam.audioUrl;
      setAudioRef(audio);
    }
  };

  const handleAudioToggle = () => {
    console.log("Audio toggle clicked, current state:", {
      isPlaying,
      audioLoading,
      audioError,
    });

    if (audioLoading || audioError) {
      console.log("Cannot toggle: audio is loading or has error");
      return;
    }

    if (isPlaying) {
      handleAudioPause();
    } else {
      handleAudioPlay();
    }
  };

  const handleAudioSeek = (value: number[]) => {
    if (audioRef && duration > 0) {
      setIsSeeking(true);
      const newTime = (value[0] / 100) * duration;
      audioRef.currentTime = newTime;
      setCurrentTime(newTime);
      // Stop seeking after a short delay to allow timeupdate to resume
      setTimeout(() => setIsSeeking(false), 200);
    }
  };

  // Initialize audio element
  useEffect(() => {
    // Validate audio URL
    if (
      !exam.audioUrl ||
      typeof exam.audioUrl !== "string" ||
      exam.audioUrl.trim() === ""
    ) {
      console.warn("Invalid or empty audio URL:", exam.audioUrl);
      setAudioError("Invalid audio URL");
      return;
    }

    console.log("Initializing audio with URL:", exam.audioUrl);
    setAudioLoading(true);
    setAudioError(null);

    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";

    const handleLoadStart = () => {
      setAudioLoading(true);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoading(false);
      console.log("Audio loaded successfully. Duration:", audio.duration);
    };

    const handleTimeUpdate = () => {
      // Only update current time if not seeking to avoid conflicts
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      handleStopRef.current(); // Call parent's handleStop via ref when audio ends
    };

    const handleError = (e: any) => {
      console.error("Audio loading error details:", {
        error: e,
        audioUrl: exam.audioUrl,
        audioSrc: audio.src,
        networkState: audio.networkState,
        readyState: audio.readyState,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
      });
      setAudioError(
        `Failed to load audio: ${audio.error?.message || "Unknown error"}`,
      );
      setAudioLoading(false);
    };

    const handleCanPlayThrough = () => {
      setAudioLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    // Add event listeners
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Set the source last to trigger loading
    audio.src = exam.audioUrl;
    setAudioRef(audio);

    return () => {
      // Proper cleanup
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);

      audio.pause();
      audio.src = "";
      setAudioRef(null);
    };
  }, [exam.audioUrl]); // Only depend on audioUrl

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);
      const questionId = exam.questions[index].id;
      ensureQuestionInList(questionId);
    };

    emblaApi.on("select", onSelect);

    // Trigger once on mount
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, exam.questions]);

  useEffect(() => {
    if (hour === 0 && minute === 0 && second === 0) {
      setIsTimeUp(true);
      setIsOpenDialog(true);
    }
  }, [hour, minute, second]);

  // Add keyboard navigation and audio shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === " " || event.code === "Space") {
        // Spacebar to play/pause audio
        event.preventDefault();
        console.log("Spacebar pressed for audio toggle");
        if (!audioLoading && !audioError) {
          handleAudioToggle();
        } else {
          console.log("Cannot use spacebar: audio is loading or has error");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    emblaApi,
    isPlaying,
    audioLoading,
    audioError,
    handleAudioPlay,
    handleAudioPause,
    handleAudioToggle,
  ]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef) {
        console.log("Cleaning up audio element on unmount");
        audioRef.pause();
        audioRef.src = "";
        audioRef.load(); // Reset the audio element
      }
    };
  }, [audioRef]); // Depend on audioRef to clean up when it changes

  return (
    <div className={styles.testingContent}>
      <div className="testingContentLeft">
        <div className="flex flex-col gap-8 px-8 py-8 border-b border-gray-200">
          <span className="text-left text-[14px] font-bold text-black">
            Hướng dẫn:{" "}
            <span className="font-medium text-black">{exam.direction}</span>
          </span>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                audioLoading || audioError
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-80 active:scale-95"
              } ${
                isPlaying
                  ? "bg-green-50 rounded-full p-1"
                  : "hover:bg-gray-50 rounded-full p-1"
              }`}
              onClick={
                audioLoading || audioError ? undefined : handleAudioToggle
              }
              title={
                audioLoading
                  ? "Loading audio..."
                  : audioError
                    ? "Audio error - check your connection"
                    : isPlaying
                      ? "Pause audio (Spacebar)"
                      : "Play audio (Spacebar)"
              }
            >
              <img
                src={isPlaying ? PauseIcon : PlayIcon}
                alt={isPlaying ? "pause" : "play"}
                className={`transition-all duration-200 ${
                  audioLoading ? "animate-pulse" : ""
                } ${isPlaying ? "scale-110" : ""}`}
              />
              {audioLoading && (
                <span className="text-xs text-gray-500 animate-pulse">
                  Loading...
                </span>
              )}
            </div>
            <div className="flex-1">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                max={100}
                step={0.1}
                onValueChange={handleAudioSeek}
                disabled={
                  !audioRef || duration === 0 || audioLoading || !!audioError
                }
                className="w-full"
              />
            </div>
            <div className={styles.chooseAnswerQuesAudioItem}>
              <img src={AudioIcon} alt="audio" />
              <span
                className={`text-xs ml-1 ${
                  isPlaying ? "text-green-600 font-medium" : "text-gray-500"
                }`}
              >
                {isPlaying && !audioLoading && !audioError && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                )}
                {audioError ? (
                  <div className="flex items-center gap-1">
                    <span className="text-red-500 text-xs">Error</span>
                    <button
                      onClick={handleAudioRetry}
                      className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Retry loading audio"
                    >
                      Retry
                    </button>
                  </div>
                ) : audioLoading ? (
                  "Loading..."
                ) : duration > 0 ? (
                  `${Math.floor(currentTime / 60)}:${Math.floor(
                    currentTime % 60,
                  )
                    .toString()
                    .padStart(2, "0")} / ${Math.floor(
                    duration / 60,
                  )}:${Math.floor(duration % 60)
                    .toString()
                    .padStart(2, "0")}`
                ) : (
                  "0:00 / 0:00"
                )}
              </span>
            </div>
          </div>
          {exam.imageUrl ? (
            <img src={exam.imageUrl} alt="img" className="w-full h-auto" />
          ) : null}
        </div>
        <Carousel
          className="flex flex-col px-8 py-8 gap-4"
          setApi={setEmblaApi}
        >
          <CarouselContent>
            {exam.questions.map((question, index) => (
              <CarouselItem key={index}>
                <div className={styles.chooseAnswerQues}>
                  <h3>Câu {index + 1}</h3>
                  <img
                    src={question.imageUrl}
                    alt="img"
                    className="w-[50%] h-auto mt-[-1rem]"
                  />
                  <div className={styles.chooseAnswerQuesAnswer}>
                    {question.typeQuestion === "Choose the correct answer" ? (
                      sortOptionsBySymbol(question.options || []).map(
                        (option) => (
                          <Answer
                            key={option.id}
                            symbol={option.symbol}
                            description={option.description}
                            handleClick={() => {
                              setIsEmpty(false); // User has chosen an answer
                              setExam({
                                ...exam,
                                questions: exam.questions.map((_question) => {
                                  if (_question.id === question.id) {
                                    return {
                                      ..._question,
                                      type: (_question as any).type,
                                      options: _question.options?.map(
                                        (_option) => ({
                                          ..._option,
                                          isSelected: _option.id === option.id,
                                        }),
                                      ),
                                    };
                                  }
                                  return {
                                    ..._question,
                                    type: (_question as any).type,
                                  };
                                }),
                              });
                              ensureQuestionInList(question.id);
                              setListOfAnswers((prev) =>
                                prev.map((answer) =>
                                  answer.questionId === question.id
                                    ? { ...answer, answer: option.id }
                                    : answer,
                                ),
                              );
                            }}
                            isSelected={option.isSelected}
                          />
                        ),
                      )
                    ) : (
                      <div className="flex flex-col gap-4">
                        <p className="text-left text-[14px] font-medium text-gray-500">
                          Điền đáp án vào chỗ trống dưới đây:
                        </p>
                        <Input
                          type="text"
                          className="your-input-class py-7 rounded-md"
                          placeholder="Nhập đáp án của bạn"
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    className={`${styles.markToReview} ${
                      ListOfAnswers.find(
                        (answer) =>
                          answer.questionId === question.id && answer.isMarked,
                      )
                        ? styles.marked
                        : ""
                    }`}
                    onClick={() => handleMarkToReview(question.id)}
                  >
                    <p>Xem lại</p>
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-8 top-1/8 -translate-y-1/2 z-10 " />
          <CarouselNext className="absolute right-8 top-1/8 -translate-y-1/2 z-10 " />
        </Carousel>
      </div>
      <div className={styles.testingContentRight}>
        <TimeAndAnwers
          hour={hour}
          minute={minute}
          second={second}
          handlePlay={handlePlay}
          handleStop={handleStop}
          listOfQuestions={exam.questions}
          ListOfAnswers={ListOfAnswers}
          currentIndex={currentIndex}
          setCurrentIndex={handleChecklistClick}
          handleOpenDialog={handleOpenDialog}
        />
      </div>

      {isTimeUp && (
        <Notification
          type="time-up"
          isOpenDialog={isTimeUp}
          handleExitTesting={handleExitTesting}
          handleViewResult={handleViewResult}
        />
      )}

      {isOpenDialog && (
        <Notification
          type="submit"
          isOpenDialog={isOpenDialog}
          isEmpty={isEmpty}
          setIsOpenDialog={setIsOpenDialog}
          isSubmitting={isSubmitting}
          isSubmittingSuccess={isSubmittingSuccess}
          handleExitTesting={handleExitTesting}
          handleViewResult={handleViewResult}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default TestingContent;
