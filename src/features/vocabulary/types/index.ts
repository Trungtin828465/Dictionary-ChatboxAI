/**
 * Represents a vocabulary item
 */
export interface VocabularyItem {
  id: string;
  word: string;
  type: string;
  pronunciation: string;
  meaning: string;
  vietnameseMeaning: string;
  example: string;
}

/**
 * API response for vocabulary items
 */
export interface VocabularyResponse {
  items: VocabularyItem[];
  total: number;
}

/**
 * State of a vocabulary items operation
 */
export interface VocabularyOperationState {
  fetchingItems: boolean;
  deletingItem: boolean;
  deletingSelected: boolean;
  savingItem: boolean;
}

/**
 * Props for the vocabulary row component
 */
export interface VocabularyRowProps {
  item: VocabularyItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onNavigateToWord: (word: string) => void;
  onPlayAudio: (url: string) => void;
  isAudioPlaying: (url: string) => boolean;
  onDeleteItem: (id: string) => void;
  index: number;
}
