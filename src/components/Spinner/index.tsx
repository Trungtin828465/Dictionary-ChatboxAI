import styles from "./styles.module.scss";

export function Spinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>
        <div className={styles.dot1}></div>
        <div className={styles.dot2}></div>
        <div className={styles.dot3}></div>
      </div>
    </div>
  );
}

export function SpinnerAnswering() {
  return (
    <div className="col-3">
      <div className="snippet" data-title="dot-falling">
        <div className="stage">
          <div className={styles.dotFalling}></div>
        </div>
      </div>
    </div>
  );
}
