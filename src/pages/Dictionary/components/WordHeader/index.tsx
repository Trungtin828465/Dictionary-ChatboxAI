import HeartIcon from "@/assets/icons/heart.svg?react";
import LoundSpeakIcon from "@/assets/icons/loundspeaker.svg?react";
import ShareIcon from "@/assets/icons/share.svg?react";
import styles from "./styles.module.scss";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { api, api_version } from "@/services/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface WordHeaderProps {
  word: string;
  phonetic: string;
  audioUrl?: string;
  definition?: string;
  type?: string;
  meaning?: string;
}

export function WordHeader({
  word,
  phonetic,
  audioUrl,
  definition,
  type,
  meaning,
}: WordHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const [listWorkspace, setListWorkspace] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const { toast } = useToast();

  const fetchListWorkspace = async () => {
    try {
      const response: any[] = await api.get(
        `/${api_version}/Workspace/${user?.id}`,
      );
      setListWorkspace(response);
    } catch (error) {
      console.error("Failed to fetch list workspace:", error);
    }
  };

  useEffect(() => {
    fetchListWorkspace();
  }, []);

  const handlePlayAudio = async () => {
    if (audioUrl && !isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      try {
        await audio.play();

        await new Promise((resolve) => {
          audio.onended = resolve;
        });
      } catch (err) {
        console.error("Failed to play audio:", err);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  const handleAddToWorkspace = async () => {
    try {
      if (selectedWorkspace) {
        const data = {
          word: word || "",
          definition: definition || "",
          workspaceId: selectedWorkspace || "",
          type: type || "",
          pronunciation: phonetic + "|" + audioUrl || "",
          meaning: meaning || "",
          vietnameseMeaning: "",
        };
        const response = await api.post(`/${api_version}/Dictionary`, data);
        if (response) {
          const workspaceName = listWorkspace.find(
            (workspace) => workspace.id === selectedWorkspace,
          )?.name;
          toast({
            title: `Thêm từ vựng ${word} thành công vào danh sách ${workspaceName}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to add to workspace:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm từ vựng vào danh sách",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.wordGroup}>
        <h2 className={styles.word}>{word}</h2>
        <p className={styles.pronunciation}>{phonetic}</p>
      </div>
      <div className={styles.actions}>
        <AlertDialog>
          <AlertDialogTrigger>
            <HeartIcon className={`${styles.actionIcon} ${styles.heart}`} />
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Vui lòng chọn danh sách từ vựng
              </AlertDialogTitle>
              <Select
                value={selectedWorkspace || ""}
                onValueChange={(value) => {
                  setSelectedWorkspace(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh sách" />
                </SelectTrigger>
                <SelectContent>
                  {listWorkspace.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddToWorkspace}>
                Thêm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <LoundSpeakIcon
          className={`${styles.actionIcon} ${styles.speaker} ${
            !audioUrl || isPlaying ? styles.disabled : ""
          } ${isPlaying ? styles.playing : ""}`}
          onClick={handlePlayAudio}
        />
        <ShareIcon className={`${styles.actionIcon} ${styles.share}`} />
      </div>
    </div>
  );
}
