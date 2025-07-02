import CloseIcon from "@/assets/icons/Close.svg?react";
import BookImage from "@/assets/icons/books.svg?react";
import TickIcon from "@/assets/icons/check.svg?react";
import PlusCircleIcon from "@/assets/icons/pluscircle.svg?react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../Spinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import styles from "./styles.module.scss";

interface WorkspaceItem {
  id?: string;
  wordCount: number;
  name: string;
  description: string;
}

// Custom hook to separate data fetching logic
function useWorkspaces() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await api.get(`/Workspace/${user.id}`);
      if (Array.isArray(data)) {
        setWorkspaces(data);
      } else {
        console.error("API returned invalid data:", data);
        toast({
          title: "Lỗi",
          description: "Định dạng dữ liệu không hợp lệ",
        });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "Error loading workspaces:",
          error.response?.data || error.message,
        );
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách. Vui lòng thử lại!",
        });
      } else {
        console.error("Error loading workspaces:", error);
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi không mong muốn",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const addWorkspace = useCallback(
    async (name: string, description: string = "Mô tả mặc định") => {
      if (!user?.id || !name.trim()) {
        return { success: false, message: "Tên danh sách không hợp lệ" };
      }

      setIsLoading(true);
      try {
        const data = await api.post(`/Workspace`, {
          userId: user.id,
          name: name.trim(),
          description,
        });

        if (data && data.id) {
          setWorkspaces((prev) => [...prev, data]);
          toast({
            title: "Thành công",
            description: "Đã tạo danh sách mới thành công!",
          });
          return { success: true };
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tạo danh sách. Vui lòng thử lại!",
          });
          return { success: false, message: "Dữ liệu trả về không hợp lệ" };
        }
      } catch (error) {
        let errorMessage = "Không thể tạo danh sách. Vui lòng thử lại!";

        if (isAxiosError(error)) {
          const responseMessage =
            error.response?.data?.message || error.message;
          errorMessage = `Không thể tạo danh sách: ${responseMessage}`;
          console.error("Error adding workspace:", responseMessage);
        } else {
          console.error("Error adding workspace:", error);
        }

        toast({
          title: "Lỗi",
          description: errorMessage,
        });

        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, toast],
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!workspaceId) return false;

      setIsLoading(true);
      try {
        const response = await api.delete(`/Workspace/${workspaceId}`);
        if (response) {
          // Update the workspace list by filtering out the deleted workspace
          setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
          toast({
            title: "Thành công",
            description: "Đã xóa danh sách thành công!",
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to delete workspace:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa danh sách. Vui lòng thử lại sau.",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspaces,
    isLoading,
    fetchWorkspaces,
    addWorkspace,
    deleteWorkspace,
  };
}

// Delete confirmation dialog component
interface DeleteDialogProps {
  workspace: WorkspaceItem;
  onDelete: (
    workspace: WorkspaceItem,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  isLoading: boolean;
}

function DeleteWorkspaceDialog({
  workspace,
  onDelete,
  isLoading,
}: DeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CloseIcon
          onClick={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          aria-label="Xóa danh sách"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // Trigger the onClick handler manually
              e.currentTarget.dispatchEvent(
                new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                }),
              );
            }
          }}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa danh sách</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa danh sách "{workspace.name}" không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={(e) => e.stopPropagation()}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            onClick={(e) => onDelete(workspace, e)}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WorkspaceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workspaces, isLoading, addWorkspace, deleteWorkspace } =
    useWorkspaces();
  const [openNewWorkspace, setOpenNewWorkspace] = useState(false);
  const [error, setError] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const handleExitWorkspace = useCallback(() => {
    setOpenNewWorkspace(false);
    setNewWorkspaceName("");
    setError("");
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!newWorkspaceName.trim()) {
        setError("Vui lòng nhập tên danh sách!");
        return;
      }
      setError("");
      setIsOpenDialog(open);
    },
    [newWorkspaceName],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewWorkspaceName(e.target.value);
      setError("");
    },
    [],
  );

  const navigateToWorkspace = useCallback(
    (workspace: WorkspaceItem) => {
      if (!workspace.id) {
        toast({
          title: "Lỗi",
          description: "Danh sách không hợp lệ",
        });
        return;
      }

      navigate(`/my-vocab/${workspace.name}`, {
        state: { workspaceId: workspace.id },
      });
    },
    [navigate, toast],
  );

  const startNewWorkspace = useCallback(() => {
    setOpenNewWorkspace(true);
  }, []);

  const handleAddWorkspace = useCallback(async () => {
    try {
      const result = await addWorkspace(newWorkspaceName);
      if (result) {
        setNewWorkspaceName("");
        setOpenNewWorkspace(false);
        setIsOpenDialog(false);
      } else {
        setError("Không thể tạo danh sách. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error adding workspace:", error);
      setError("Không thể tạo danh sách. Vui lòng thử lại!");
    }
  }, [newWorkspaceName, addWorkspace]);

  const handleDeleteWorkspace = useCallback(
    async (
      workspace: WorkspaceItem,
      e: React.MouseEvent<HTMLButtonElement>,
    ) => {
      e.stopPropagation();
      e.preventDefault();

      if (!workspace.id) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa danh sách không hợp lệ",
        });
        return;
      }

      await deleteWorkspace(workspace.id);
    },
    [deleteWorkspace, toast],
  );

  // Memoize the workspace cards to prevent unnecessary re-renders
  const workspaceCards = useMemo(() => {
    return workspaces.map((workspace) => (
      <div
        key={workspace.id}
        onClick={() => navigateToWorkspace(workspace)}
        className={styles.workspaceCard}
        tabIndex={0}
        role="button"
        aria-label={`Danh sách ${workspace.name} với ${workspace.wordCount} từ`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateToWorkspace(workspace);
          }
        }}
      >
        <div className={styles.imageContainer}>
          <BookImage className={styles.bookImage} />
          <div>
            <p className={styles.title}>{workspace.name}</p>
            <div className={styles.wordCount}>{workspace.wordCount} từ</div>
          </div>
        </div>
        <div className={styles.deleteWorkspaceIcon}>
          <DeleteWorkspaceDialog
            workspace={workspace}
            onDelete={handleDeleteWorkspace}
            isLoading={isLoading}
          />
        </div>
      </div>
    ));
  }, [workspaces, navigateToWorkspace, handleDeleteWorkspace, isLoading]);

  const addNewWorkspaceCard = useMemo(
    () => (
      <div
        onClick={startNewWorkspace}
        className={styles.workspaceCard}
        tabIndex={0}
        role="button"
        aria-label="Thêm danh sách mới"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startNewWorkspace();
          }
        }}
      >
        <div className={styles.imageContainer}>
          <PlusCircleIcon className={styles.bookImage} />
          <div>
            <p className={styles.title}>Thêm danh sách mới</p>
          </div>
        </div>
      </div>
    ),
    [startNewWorkspace],
  );

  const newWorkspaceForm = useMemo(
    () => (
      <div className={styles.addWorkspace}>
        <BookImage className={styles.bookImage} />
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Nhập tên danh sách"
            value={newWorkspaceName}
            onChange={handleInputChange}
            disabled={isLoading}
            autoFocus
            aria-label="Tên danh sách mới"
            aria-invalid={!!error}
            aria-describedby={error ? "workspace-name-error" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newWorkspaceName.trim()) {
                e.preventDefault();
                setIsOpenDialog(true);
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleExitWorkspace();
              }
            }}
          />
          {error && (
            <p
              id="workspace-name-error"
              className="text-red-500 text-xs text-center"
            >
              {error}
            </p>
          )}
          <div className={styles.submitWorkspaceIcon}>
            <span>
              <Dialog onOpenChange={handleOpenChange} open={isOpenDialog}>
                <DialogTrigger asChild>
                  <button
                    aria-label="Xác nhận thêm danh sách"
                    disabled={!newWorkspaceName.trim() || isLoading}
                  >
                    <TickIcon />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Thêm danh sách mới</DialogTitle>
                    <DialogDescription>
                      Bạn có chắc chắn muốn thêm danh sách "{newWorkspaceName}"
                      không?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button
                      className="bg-secondary text-white hover:bg-white hover:text-secondary hover:border-secondary"
                      onClick={handleAddWorkspace}
                      disabled={isLoading}
                    >
                      Thêm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </span>
          </div>
        </div>
        <div className={styles.deleteWorkspaceIcon}>
          <CloseIcon
            onClick={handleExitWorkspace}
            role="button"
            tabIndex={0}
            aria-label="Hủy thêm danh sách mới"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleExitWorkspace();
              }
            }}
          />
        </div>
      </div>
    ),
    [
      newWorkspaceName,
      handleInputChange,
      isLoading,
      error,
      handleOpenChange,
      isOpenDialog,
      handleAddWorkspace,
      handleExitWorkspace,
    ],
  );

  if (isLoading && workspaces.length === 0) {
    return <Spinner aria-label="Đang tải danh sách" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.workspaceGrid}>
        {workspaceCards}
        {openNewWorkspace ? newWorkspaceForm : addNewWorkspaceCard}
      </div>
    </div>
  );
}
