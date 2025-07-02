import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { listeningService } from "../api/listening-service";
import { Band } from "../types/Bands";
import BandSidebar from "./sidebar/BandSidebar";
import SidebarContent from "./sidebar/SidebarContent";
import styles from "./style.module.scss";
import { Spinner } from "@/components/Spinner";

const ListeningTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bands, setBands] = useState<Band[]>([]);
  const [activeBand, setActiveBand] = useState<Band>();

  const fetchProficiencyList = async () => {
    setIsLoading(true);
    const proficiencyList = await listeningService.getProficiencyList();
    setBands(proficiencyList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProficiencyList();
    setActiveBand(bands[0]);
  }, []);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="py-3">
          <h1 className="text-[20px] font-bold mb-6">
            Tổng hợp đề thi thử kỹ năng Listening
          </h1>
          <Card className={styles.listeningTab}>
            <Card className={styles.bandSidebar}>
              <BandSidebar
                bands={bands}
                activeBand={activeBand || bands[0]}
                onSelect={setActiveBand}
              />
            </Card>
            <SidebarContent
              activeBand={activeBand || bands[0]}
              description={activeBand?.description || ""}
            />
          </Card>
        </div>
      )}
    </>
  );
};

export default ListeningTab;
