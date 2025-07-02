import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { readingService, Topic } from "./api/reading-service";
import { Band } from "./Types/Bands";
import BandSidebar from "./components/sidebar/BandSidebar";
import SidebarContent from "./components/sidebar/SidebarContent";
import styles from "./components/style.module.scss";

const ReadingTab = () => {
  const [bands, setBands] = useState<Band[]>([]);
  const [activeBand, setActiveBand] = useState<Band | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBands = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await readingService.getProficiencyList();
        setBands(data);
        setActiveBand(data[0]);
        // Initially select the first topic of the first band, if available
        if (data.length > 0) {
          const topics = await readingService.getTopicsByProficiencyId(
            data[0].id,
          );
          if (topics.length > 0) {
            setSelectedTopic(topics[0]);
          }
        }
      } catch (err: any) {
        setError(
          "Không thể tải danh sách band. Vui lòng kiểm tra lại API hoặc kết nối mạng.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBands();
  }, []);

  // Reset selected topic when active band changes
  useEffect(() => {
    setSelectedTopic(null);
  }, [activeBand]);

  return (
    <div className="py-3">
      <h1 className="text-[20px] font-bold mb-6">
        Tổng hợp đề Reading theo các band điểm
      </h1>
      <Card className={styles.readingTab}>
        {loading ? (
          <div className="w-full text-center py-10">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="w-full text-center text-red-500 py-10">{error}</div>
        ) : (
          <>
            <Card className={styles.bandSidebar}>
              <BandSidebar
                bands={bands}
                activeBand={activeBand}
                onSelect={setActiveBand}
                onSelectTopic={setSelectedTopic}
              />
            </Card>
            {activeBand && (
              <SidebarContent
                activeBand={activeBand}
                description={activeBand?.description || ""}
                selectedTopic={selectedTopic}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ReadingTab;
