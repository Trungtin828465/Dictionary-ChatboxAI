import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/Spinner";
import styles from "./styles.module.scss";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { handleApiError } from "@/utils/error-handling";
import { workspaceService } from "@/features/workspaces/api/workspace-service";
import { useVocabularyItems } from "@/features/vocabulary/hooks/useVocabularyItems";
import { useAudioPlayer } from "@/features/vocabulary/hooks/useAudioPlayer";
import VocabularyTable from "@/features/vocabulary/components/VocabularyTable";
import WorkspaceTitle from "@/features/workspaces/components/WorkspaceTitle";
import EmptyState from "@/features/vocabulary/components/EmptyState";

export default function WorkspaceDetails() {
  const location = useLocation();
  const { workspaceId } = location.state || {};
  const { user } = useAuth();
  const { title: initialTitle } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialTitle || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Use our custom hooks
  const {
    vocabularyItems,
    selectedVocabulary,
    isLoading,
    error,
    isDeletingItems,
    toggleAllSelection,
    toggleItemSelection,
    deleteVocabularyItem,
    deleteSelectedVocabulary,
    isAllSelected,
    isItemSelected,
    hasSelections,
    clearSelections,
  } = useVocabularyItems(workspaceId);

  const { playAudio, isPlayingUrl } = useAudioPlayer();

  // Navigation handler
  const navigateToWordDetails = useCallback(
    (word: string) => {
      navigate(`/dictionary?word=${word}`);
    },
    [navigate],
  );

  // Handle title update
  const handleSaveTitle = useCallback(async () => {
    if (!workspaceId || !title.trim()) return;

    setIsSavingTitle(true);

    try {
      // Update the workspace title via API
      await workspaceService.updateWorkspace(workspaceId, {
        name: title.trim(),
        userId: user?.id || "",
        description: "",
      });

      // Update URL to reflect the new title
      const currentPath = location.pathname;
      const basePath = currentPath.substring(
        0,
        currentPath.lastIndexOf("/") + 1,
      );
      navigate(`${basePath}${encodeURIComponent(title.trim())}`, {
        state: { workspaceId },
        replace: true,
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật tên danh sách từ vựng",
      });
    } catch (error) {
      handleApiError(error, toast, "Đã xảy ra lỗi khi cập nhật tên danh sách");
    } finally {
      setIsSavingTitle(false);
    }
  }, [workspaceId, title, user?.id, location.pathname, navigate, toast]);

  // Handle workspace deletion
  const handleDeleteWorkspace = useCallback(async () => {
    if (!workspaceId) return;

    setIsDeleting(true);

    try {
      // Call API to delete the workspace
      await workspaceService.deleteWorkspace(workspaceId);

      // Show success message
      toast({
        title: "Thành công",
        description: "Đã xóa danh sách từ vựng",
      });

      // Navigate back to the workspace list
      navigate("/my-vocab");
    } catch (error) {
      handleApiError(error, toast, "Đã xảy ra lỗi khi xóa danh sách từ vựng");
    } finally {
      setIsDeleting(false);
    }
  }, [workspaceId, navigate, toast]);

  // Loading state
  if (isLoading) {
    return <Spinner aria-label="Đang tải danh sách từ vựng" />;
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {/* Use our refactored WorkspaceTitle component */}
        <WorkspaceTitle
          workspaceId={workspaceId}
          title={title}
          initialTitle={initialTitle || ""}
          isSaving={isSavingTitle}
          isDeleting={isDeleting}
          onSaveTitle={handleSaveTitle}
          onDeleteWorkspace={handleDeleteWorkspace}
          onTitleChange={setTitle}
        />

        {/* Bulk selection actions */}
        {hasSelections && (
          <div className={styles.actionsBar}>
            <Button
              variant="outline"
              onClick={clearSelections}
              className={styles.actionButton}
            >
              Bỏ chọn ({selectedVocabulary.length})
            </Button>

            <AlertDialog
              open={isDeleteConfirmOpen}
              onOpenChange={setIsDeleteConfirmOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className={styles.actionButton}
                  disabled={isDeletingItems}
                >
                  Xóa đã chọn ({selectedVocabulary.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {/* Dialog content is in a separate component */}
                <DeleteConfirmationDialog
                  count={selectedVocabulary.length}
                  isDeleting={isDeletingItems}
                  onCancel={() => setIsDeleteConfirmOpen(false)}
                  onConfirm={async () => {
                    await deleteSelectedVocabulary();
                    setIsDeleteConfirmOpen(false);
                  }}
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Use our refactored VocabularyTable component */}
        {vocabularyItems.length === 0 ? (
          <EmptyState />
        ) : (
          <VocabularyTable
            vocabularyItems={vocabularyItems}
            isAllSelected={isAllSelected}
            toggleAllSelection={toggleAllSelection}
            toggleItemSelection={toggleItemSelection}
            isItemSelected={isItemSelected}
            navigateToWordDetails={navigateToWordDetails}
            playAudio={playAudio}
            isPlayingUrl={isPlayingUrl}
            deleteVocabularyItem={deleteVocabularyItem}
          />
        )}
      </div>
    </div>
  );
}

// Helper component for delete confirmation
function DeleteConfirmationDialog({
  count,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  count: number;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
        <AlertDialogDescription>
          Bạn có chắc chắn muốn xóa {count} từ vựng đã chọn không? Hành động này
          không thể hoàn tác.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting} onClick={onCancel}>
          Hủy
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
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
    </>
  );
}
