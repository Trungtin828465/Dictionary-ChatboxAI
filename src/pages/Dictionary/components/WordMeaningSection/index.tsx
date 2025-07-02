import styles from "./styles.module.scss";
import { Definition as DefinitionType } from "../../types";
interface WordMeaningSectionProps {
  partOfSpeech: string;
  definitions: DefinitionType[];
  synonyms: string[];
  antonyms: string[];
}

export function WordMeaningSection({
  partOfSpeech,
  definitions,
  synonyms,
  antonyms,
}: WordMeaningSectionProps) {
  return (
    <div>
      <div className={styles.divider} />
      <div className={styles.wordType}>
        <span>({partOfSpeech})</span>
      </div>

      <div className={styles.meaningList}>
        <h5 className={styles.label}>Meaning</h5>
        {definitions.map((def, idx) => (
          <div key={idx} className={styles.meaningItem}>
            <div>
              <span className={styles.meaningNumber}>{idx + 1}. </span>
              {def.definition}
            </div>
            {def.example && (
              <div className={styles.example}>
                <span className={styles.label}>Example:</span> {def.example}
              </div>
            )}
          </div>
        ))}
      </div>

      {synonyms.length > 0 && (
        <div className={styles.synonyms}>
          <p className={styles.label}>Synonyms: </p>
          <p className={styles.list}>
            {synonyms.map((syn, idx) => (
              <span key={idx}>
                "{syn}"{idx < synonyms.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      {antonyms.length > 0 && (
        <div className={styles.antonyms}>
          <p className={styles.label}>Antonyms: </p>
          <p className={styles.list}>
            {antonyms.map((ant, idx) => (
              <span key={idx}>
                "{ant}"{idx < antonyms.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
