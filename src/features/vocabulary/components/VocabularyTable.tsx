import { memo, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styles from "@/pages/WorkspaceDetails/styles.module.scss";
import VocabularyRow from "./VocabularyRow";
import EmptyState from "./EmptyState";
import { VocabularyItem } from "../types";

interface VocabularyTableProps {
  vocabularyItems: VocabularyItem[];
  isAllSelected: boolean;
  toggleAllSelection: () => void;
  toggleItemSelection: (id: string) => void;
  isItemSelected: (id: string) => boolean;
  navigateToWordDetails: (word: string) => void;
  playAudio: (url: string) => void;
  isPlayingUrl: (url: string) => boolean;
  deleteVocabularyItem: (id: string) => Promise<boolean>;
}

const VocabularyTable = memo(function VocabularyTable({
  vocabularyItems,
  isAllSelected,
  toggleAllSelection,
  toggleItemSelection,
  isItemSelected,
  navigateToWordDetails,
  playAudio,
  isPlayingUrl,
  deleteVocabularyItem,
}: VocabularyTableProps) {
  // Memoize the table header to prevent unnecessary re-renders
  const tableHeader = useMemo(
    () => (
      <TableHeader>
        <TableRow>
          <TableHead className={styles.checkboxCell}>
            <div
              className={`${styles.checkbox} ${
                isAllSelected ? styles.checked : ""
              }`}
              onClick={toggleAllSelection}
              role="checkbox"
              aria-checked={isAllSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleAllSelection();
                }
              }}
              aria-label="Chọn tất cả từ vựng"
            ></div>
          </TableHead>
          <TableHead className={styles.vocabulary}>Từ vựng</TableHead>
          <TableHead className={styles.type}>Loại từ</TableHead>
          <TableHead className={styles.pronunciation}>Phiên âm</TableHead>
          <TableHead className={styles.meaning}>Nghĩa</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
    ),
    [isAllSelected, toggleAllSelection],
  );

  // Memoize the table body content
  const tableContent = useMemo(
    () => (
      <TableBody>
        {vocabularyItems.map((item, index) => (
          <VocabularyRow
            key={item.id}
            item={item}
            isSelected={isItemSelected(item.id)}
            onToggleSelection={toggleItemSelection}
            onNavigateToWord={navigateToWordDetails}
            onPlayAudio={playAudio}
            isAudioPlaying={isPlayingUrl}
            onDeleteItem={deleteVocabularyItem}
            index={index}
          />
        ))}
      </TableBody>
    ),
    [
      vocabularyItems,
      isItemSelected,
      toggleItemSelection,
      navigateToWordDetails,
      playAudio,
      isPlayingUrl,
      deleteVocabularyItem,
    ],
  );

  if (vocabularyItems.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={styles.tableContainer}
      role="region"
      aria-label="Danh sách từ vựng"
    >
      <Table>
        {tableHeader}
        {tableContent}
      </Table>
    </div>
  );
});

export default VocabularyTable;
