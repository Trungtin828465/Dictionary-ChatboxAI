import EXAMS from "@/assets/icons/exams.svg?react";
import { Band } from "../../types/Bands";
import styles from "../style.module.scss";

interface BandSidebarProps {
  bands: Band[];
  activeBand: Band;
  onSelect: (band: Band) => void;
}

const BandSidebar = ({ bands, activeBand, onSelect }: BandSidebarProps) => {
  return (
    <aside className={styles.bandSidebar}>
      {bands.map((band) => (
        <button
          key={band.id}
          onClick={() => onSelect(band)}
          className={`${styles.bandButton} ${
            activeBand.id === band.id
              ? "bg-[#d0f5eb] font-semibold"
              : "hover:bg-[#e0f7f1]"
          }`}
        >
          <div className="flex items-center gap-1 text-sm">
            <EXAMS className={styles.bandIcon} />
            {band.name}
          </div>
        </button>
      ))}
    </aside>
  );
};

export default BandSidebar;
