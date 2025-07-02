import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/error-handling";
import { vocabularyService } from "../api/vocabulary-service";
import { VocabularyItem, VocabularyOperationState } from "../types";

/**
 * Hook for managing vocabulary items
 */
export function useVocabularyItems(workspaceId?: string) {
  const { toast } = useToast();
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Better loading state management
  const [loadingStates, setLoadingStates] = useState<VocabularyOperationState>({
    fetchingItems: false,
    deletingItem: false,
    deletingSelected: false,
    savingItem: false,
  });

  // Fetch vocabulary items
  const fetchVocabularyItems = useCallback(async () => {
    if (!workspaceId) {
      const errorMsg = "Không tìm thấy danh sách từ vựng";
      setError(errorMsg);
      toast({
        title: "Lỗi",
        description: errorMsg,
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, fetchingItems: true }));
    setError(null);

    try {
      const data = await vocabularyService.getVocabularyItems(workspaceId);

      if (Array.isArray(data)) {
        setVocabularyItems(data);
      } else {
        const errorMsg = "Định dạng dữ liệu không hợp lệ";
        setError(errorMsg);
        console.error("API trả về dữ liệu không hợp lệ:", data);
        toast({
          title: "Lỗi",
          description: errorMsg,
        });
      }
    } catch (error) {
      const errorMsg = handleApiError(
        error,
        toast,
        "Không thể tải danh sách từ vựng. Vui lòng thử lại!",
      );
      setError(errorMsg);
    } finally {
      setLoadingStates((prev) => ({ ...prev, fetchingItems: false }));
    }
  }, [workspaceId, toast]);

  // Delete a vocabulary item
  const deleteVocabularyItem = useCallback(
    async (itemId: string) => {
      if (!workspaceId || !itemId) return false;

      setLoadingStates((prev) => ({ ...prev, deletingItem: true }));

      try {
        // Call API to delete the vocabulary item
        await vocabularyService.deleteVocabularyItem(itemId);

        // Update the local state with optimistic UI update
        setVocabularyItems((prev) => prev.filter((item) => item.id !== itemId));

        // If the item was selected, remove it from selections
        setSelectedVocabulary((prev) => prev.filter((id) => id !== itemId));

        toast({
          title: "Thành công",
          description: "Đã xóa từ vựng",
        });

        return true;
      } catch (error) {
        handleApiError(error, toast, "Đã xảy ra lỗi khi xóa từ vựng");
        return false;
      } finally {
        setLoadingStates((prev) => ({ ...prev, deletingItem: false }));
      }
    },
    [workspaceId, toast],
  );

  // Delete multiple vocabulary items
  const deleteSelectedVocabulary = useCallback(async () => {
    if (selectedVocabulary.length === 0) return false;

    setLoadingStates((prev) => ({ ...prev, deletingSelected: true }));

    try {
      // Store IDs before deletion for optimistic updates
      const idsToDelete = [...selectedVocabulary];

      // Create array of delete promises
      const deletePromises = idsToDelete.map((id) =>
        vocabularyService.deleteVocabularyItem(id),
      );

      // Execute all delete operations in parallel
      await Promise.all(deletePromises);

      // Update local state (optimistic UI update)
      setVocabularyItems((prev) =>
        prev.filter((item) => !idsToDelete.includes(item.id)),
      );

      // Clear selection after successful deletion
      setSelectedVocabulary([]);

      toast({
        title: "Thành công",
        description: `Đã xóa ${idsToDelete.length} từ vựng`,
      });

      return true;
    } catch (error) {
      handleApiError(error, toast, "Đã xảy ra lỗi khi xóa từ vựng");
      return false;
    } finally {
      setLoadingStates((prev) => ({ ...prev, deletingSelected: false }));
    }
  }, [selectedVocabulary, toast]);

  // Toggle selection for all items
  const toggleAllSelection = useCallback(() => {
    setSelectedVocabulary((prev) =>
      prev.length === vocabularyItems.length
        ? []
        : vocabularyItems.map((item) => item.id),
    );
  }, [vocabularyItems]);

  // Toggle selection for a single item
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedVocabulary((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  }, []);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedVocabulary([]);
  }, []);

  // Load data on mount and when workspaceId changes
  useEffect(() => {
    fetchVocabularyItems();
    clearSelections(); // Clear selections when workspace changes
  }, [fetchVocabularyItems, clearSelections]);

  return {
    // Data
    vocabularyItems,
    selectedVocabulary,
    error,

    // Loading states
    isLoading: loadingStates.fetchingItems,
    isDeletingItem: loadingStates.deletingItem,
    isDeletingItems: loadingStates.deletingSelected,
    isSavingItem: loadingStates.savingItem,

    // Actions
    toggleAllSelection,
    toggleItemSelection,
    deleteVocabularyItem,
    deleteSelectedVocabulary,
    clearSelections,
    refetch: fetchVocabularyItems,

    // Computed properties
    isAllSelected:
      vocabularyItems.length > 0 &&
      selectedVocabulary.length === vocabularyItems.length,
    isItemSelected: (itemId: string) => selectedVocabulary.includes(itemId),
    hasSelections: selectedVocabulary.length > 0,
  };
}
