import { useCallback, useRef, useState } from "react";
import styles from "@/pages/WorkspaceDetails/styles.module.scss";
import { Input } from "@/components/ui/input";
import EditIcon from "@/assets/icons/edit.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";
import XIcon from "@/assets/icons/Close.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
import FlashcardIcon from "@/assets/icons/flashcard.svg?react";
import { Spinner } from "@/components/Spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface WorkspaceTitleProps {
  workspaceId: string;
  title: string;
  initialTitle: string;
  isSaving: boolean;
  isDeleting: boolean;
  onSaveTitle: () => Promise<void>;
  onDeleteWorkspace: () => Promise<void>;
  onTitleChange: (value: string) => void;
}

export default function WorkspaceTitle({
  workspaceId,
  title,
  initialTitle,
  isSaving,
  isDeleting,
  onSaveTitle,
  onDeleteWorkspace,
  onTitleChange,
}: WorkspaceTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleEditTitle = useCallback(() => {
    setIsEditingTitle(true);
    // Focus on input after state update
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 0);
  }, []);

  const handleCancelEditTitle = useCallback(() => {
    onTitleChange(initialTitle || "");
    setIsEditingTitle(false);
  }, [initialTitle, onTitleChange]);

  const handleSaveTitle = useCallback(async () => {
    if (title.trim() === initialTitle) {
      setIsEditingTitle(false);
      return;
    }

    await onSaveTitle();
    setIsEditingTitle(false);
  }, [title, initialTitle, onSaveTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveTitle();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancelEditTitle();
      }
    },
    [handleSaveTitle, handleCancelEditTitle],
  );

  return (
    <h1 className={styles.header}>
      {isEditingTitle ? (
        <div className={styles.titleEditContainer}>
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className={styles.titleInput}
            disabled={isSaving}
            maxLength={100}
            aria-label="Chỉnh sửa tên danh sách"
          />
          <div className={styles.titleActions}>
            <CheckIcon
              onClick={handleSaveTitle}
              className={`${styles.actionIcon} ${
                isSaving ? styles.disabled : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label="Lưu tên danh sách"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isSaving) handleSaveTitle();
                }
              }}
            />
            <XIcon
              onClick={handleCancelEditTitle}
              className={`${styles.actionIcon} ${
                isSaving ? styles.disabled : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label="Hủy chỉnh sửa tên danh sách"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isSaving) handleCancelEditTitle();
                }
              }}
            />
          </div>
          {isSaving && (
            <div className={styles.titleSpinner}>
              <Spinner />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={styles.titleText}>{title}</div>
          <div className={styles.titleActions}>
            <FlashcardIcon
              onClick={() => navigate(`/flashcard/${workspaceId}`)}
              role="button"
              tabIndex={0}
              aria-label="Mở flashcard"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/flashcard/${workspaceId}`);
                }
              }}
              className={styles.flashcardIcon}
            />
            <EditIcon
              onClick={handleEditTitle}
              role="button"
              tabIndex={0}
              aria-label="Chỉnh sửa tên danh sách"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleEditTitle();
                }
              }}
              className={styles.editTitleIcon}
            />

            <AlertDialog
              open={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <TrashIcon
                  role="button"
                  className={styles.deleteTitleIcon}
                  aria-label="Xóa danh sách từ vựng"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsConfirmDialogOpen(true);
                    }
                  }}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa danh sách từ vựng "{title}" không?
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Hủy
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteWorkspace}
                    className={styles.deleteButton}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className={styles.buttonSpinner}>
                        <Spinner />
                        <span>Đang xóa...</span>
                      </div>
                    ) : (
                      "Xóa"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </h1>
  );
}
