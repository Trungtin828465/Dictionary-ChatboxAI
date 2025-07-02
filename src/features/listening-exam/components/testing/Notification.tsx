import successLottie from "@/assets/successfull-animate.json";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lottie from "lottie-react";
import styles from "./styles.module.scss";

interface NotificationProps {
  type: "time-up" | "submit";
  isOpenDialog: boolean;
  isEmpty?: boolean; // Không có đáp án nào được chọn
  setIsOpenDialog?: (isOpenDialog: boolean) => void;
  handleExitTesting: () => void;
  handleViewResult: () => void;
  handleSubmit?: () => void;
  isSubmitting?: boolean;
  isSubmittingSuccess?: boolean;
}

const Notification = ({
  type,
  isOpenDialog,
  isEmpty,
  setIsOpenDialog,
  handleExitTesting,
  handleViewResult,
  handleSubmit,
  isSubmitting = false,
  isSubmittingSuccess = false,
}: NotificationProps) => {
  const handleExit = () => {
    handleExitTesting();
  };

  // Time-up dialog content
  if (type === "time-up") {
    return (
      <Dialog open={isOpenDialog}>
        <DialogContent className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Thời gian đã hết. Bài thi đã tự động nộp</DialogTitle>
            <DialogDescription>
              Bạn đã hết thời gian làm bài. Vui lòng chọn Xem kết quả để xem kết
              quả.
            </DialogDescription>
            <DialogFooter>
              <Button
                className={`${styles.borderButton} w-full rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
                onClick={handleExit}
              >
                Thoát
              </Button>
              <Button
                className={`${styles.submitButton} bg-[#31E3A5] w-full rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
                onClick={handleViewResult}
              >
                Xem kết quả
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  // Submit dialog content
  return (
    <Dialog open={isOpenDialog}>
      <DialogContent className="flex flex-col gap-5">
        <DialogHeader>
          {isSubmittingSuccess ? (
            <div className="flex flex-col gap-6 justify-center items-center">
              <DialogTitle className="text-[20px] font-bold text-[#37474F]">
                Đã nộp bài thành công
              </DialogTitle>
              <DialogDescription className="flex flex-col justify-center items-center">
                <Lottie
                  animationData={successLottie}
                  loop={false}
                  style={{ width: 100, height: 100 }}
                />
                <p className="w-[70%] text-[14px] font-medium text-[#37474F] text-center my-4">
                  Bài làm của bạn đã được nộp thành công. Chọn xem kết quả bài
                  làm của mình tại đây
                </p>
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogTitle>
                {isSubmitting
                  ? ""
                  : isEmpty
                    ? "Bạn chưa chọn đáp án nào"
                    : "Bạn có chắc chắn muốn nộp bài?"}
              </DialogTitle>
              <DialogDescription>
                {isSubmitting ? (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-[14px] font-bold text-[#37474F] text-center">
                      Đang nộp bài...
                    </p>
                    {/* You can replace this with your Spinner component */}
                    <Spinner />
                  </div>
                ) : // "Đừng quên kiểm tra lại các đáp án của mình trước khi nộp bài để đạt kết quả tốt nhất!"
                isEmpty ? (
                  "Bạn chưa chọn đáp án nào, vui lòng chọn đáp án và nộp bài, đừng quên kiểm tra lại các đáp án của mình trước khi nộp bài để đạt kết quả tốt nhất!"
                ) : (
                  "Đừng quên kiểm tra lại các đáp án của mình trước khi nộp bài để đạt kết quả tốt nhất!"
                )}
              </DialogDescription>
            </>
          )}
          <DialogFooter>
            <Button
              className={`${styles.borderButton} w-full rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
              onClick={handleExit}
              disabled={isSubmitting}
            >
              Thoát
            </Button>
            {!isSubmittingSuccess && (
              <Button
                className={`${styles.borderButton} w-full rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
                onClick={() => setIsOpenDialog?.(false)}
                disabled={isSubmitting}
              >
                Tiếp tục làm bài
              </Button>
            )}
            {isSubmittingSuccess ? (
              <Button
                className={`${styles.borderButton} w-full bg-[#31E3A5] rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
                onClick={handleViewResult}
              >
                Xem bài làm
              </Button>
            ) : (
              !isEmpty && (
                <Button
                  className={`${styles.submitButton} w-full rounded-full text-[14px] font-bold text-[#37474F] hover:text-[#fff]`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  Nộp bài
                </Button>
              )
            )}
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Notification;
