import { memo, useCallback, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import LoundSpeakIcon from "@/assets/icons/loundspeaker.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
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
import { VocabularyRowProps } from "../types";
import styles from "@/pages/WorkspaceDetails/styles.module.scss";

const VocabularyRow = memo(function VocabularyRow({
  item,
  isSelected,
  onToggleSelection,
  onNavigateToWord,
  onPlayAudio,
  isAudioPlaying,
  onDeleteItem,
  index,
}: VocabularyRowProps) {
  const pronunciation = item.pronunciation?.split("|")[0] || "";
  const audioUrl = item.pronunciation?.split("|")[1] || "";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (audioUrl) {
        onPlayAudio(audioUrl);
      }
    },
    [audioUrl, onPlayAudio],
  );

  const handleDetailClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNavigateToWord(item.word);
    },
    [item.word, onNavigateToWord],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDeleteItem(item.id);
    setIsConfirmOpen(false);
  }, [item.id, onDeleteItem]);

  return (
    <TableRow
      className={styles.alternateRow}
      tabIndex={0}
      aria-selected={isSelected}
      data-index={index}
    >
      <TableCell className={styles.checkboxCell}>
        <div
          className={`${styles.checkbox} ${isSelected ? styles.checked : ""}`}
          onClick={() => onToggleSelection(item.id)}
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleSelection(item.id);
            }
          }}
        ></div>
      </TableCell>
      <TableCell className={styles.wordCell}>{item.word}</TableCell>
      <TableCell>{item.type}</TableCell>
      <TableCell className={styles.pronunciationCell}>
        {pronunciation}
        {audioUrl && (
          <LoundSpeakIcon
            className={`${styles.actionIcon} ${styles.speaker} ${
              isAudioPlaying(audioUrl) ? styles.playing : ""
            }`}
            onClick={handlePlayClick}
            role="button"
            aria-label={`Nghe phát âm của từ ${item.word}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handlePlayClick(e as unknown as React.MouseEvent);
              }
            }}
          />
        )}
      </TableCell>
      <TableCell className={styles.meaningCell}>
        <div className={styles.meaningText}>{item.meaning}</div>
      </TableCell>
      <TableCell className={styles.actionsCell}>
        <div className={styles.cellActions}>
          <div
            className={styles.detailsLink}
            onClick={handleDetailClick}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết từ ${item.word}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onNavigateToWord(item.word);
              }
            }}
          >
            Xem chi tiết
          </div>

          <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogTrigger asChild>
              <TrashIcon
                className={styles.deleteItemIcon}
                onClick={handleDeleteClick}
                role="button"
                aria-label={`Xóa từ ${item.word}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                  }
                }}
              />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa từ vựng "{item.word}" không? Hành
                  động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className={styles.deleteButton}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default VocabularyRow;
