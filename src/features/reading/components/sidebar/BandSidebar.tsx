import EXAMS from "@/assets/icons/exams.svg?react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { readingService, Topic } from "../../api/reading-service";
import { Band } from "../../Types/Bands";
import styles from "../style.module.scss";

interface BandSidebarProps {
  bands: Band[];
  activeBand?: Band;
  onSelect: (band: Band) => void;
  onSelectTopic: (topic: Topic | null) => void;
}

const BandSidebar = ({
  bands,
  activeBand,
  onSelect,
  onSelectTopic,
}: BandSidebarProps) => {
  const [expandedBands, setExpandedBands] = useState<{
    [key: string]: boolean;
  }>({});
  const [topics, setTopics] = useState<{ [bandId: string]: Topic[] }>({});
  const [loadingTopics, setLoadingTopics] = useState<{
    [bandId: string]: boolean;
  }>({});
  const [errorTopics, setErrorTopics] = useState<{
    [bandId: string]: string | null;
  }>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleBandClick = async (band: Band) => {
    onSelect(band);
    setExpandedBands((prevState) => ({
      ...prevState,
      [band.id]: !prevState[band.id],
    }));
    // Deselect topic when a new band is selected
    onSelectTopic(null);
    setSelectedTopic(null);

    if (!topics[band.id] && !loadingTopics[band.id]) {
      setLoadingTopics((prevState) => ({ ...prevState, [band.id]: true }));
      setErrorTopics((prevState) => ({ ...prevState, [band.id]: null }));
      try {
        const data = await readingService.getTopicsByProficiencyId(band.id);
        setTopics((prevState) => ({ ...prevState, [band.id]: data }));
      } catch (err: any) {
        setErrorTopics((prevState) => ({
          ...prevState,
          [band.id]: "Không thể tải topic.",
        }));
      } finally {
        setLoadingTopics((prevState) => ({ ...prevState, [band.id]: false }));
      }
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    onSelectTopic(topic);
  };

  return (
    <aside className={styles.bandSidebar}>
      {bands.map((band) => (
        <div key={band.id}>
          <button
            onClick={() => handleBandClick(band)}
            className={`${styles.bandButton} ${
              activeBand && activeBand.id === band.id
                ? "bg-[#d0f5eb] font-semibold"
                : "hover:bg-[#e0f7f1]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <EXAMS className={styles.bandIcon} />
                {band.band}
              </div>
              {loadingTopics[band.id] ? (
                <span>Đang tải...</span>
              ) : errorTopics[band.id] ? (
                <span className="text-red-500">Lỗi</span>
              ) : expandedBands[band.id] ? (
                <ChevronDown size={16} />
              ) : (topics[band.id]?.length || 0) > 0 ? (
                <ChevronRight size={16} />
              ) : null}
            </div>
          </button>
          {expandedBands[band.id] &&
            topics[band.id] &&
            (topics[band.id].length > 0 ? (
              <ul className="ml-8 border-l border-gray-300">
                {topics[band.id].map((topic) => (
                  <li
                    key={topic.id}
                    className={`py-1 px-4 text-sm cursor-pointer hover:bg-gray-100 ${selectedTopic?.id === topic.id ? "bg-gray-200 font-medium" : ""}`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ml-8 px-4 text-sm text-gray-500">
                Chưa có topic nào.
              </div>
            ))}
        </div>
      ))}
    </aside>
  );
};

export default BandSidebar;
