import styles from "../style.module.scss";

interface TimerProps {
  hour: number;
  minute: number;
  second: number;
}

const Timer = ({ hour, minute, second }: TimerProps) => {
  return (
    <div className={styles.timer}>
      <div className={styles.timernumber}>
        <p className={styles.number}>{hour}</p>
        <p>Giờ</p>
      </div>
      <div className={styles.timernumber}>
        <p className={styles.number}>{minute}</p>
        <p>Phút</p>
      </div>
      <div className={styles.timernumber}>
        <p className={styles.number}>{second}</p>
        <p>Giây</p>
      </div>
    </div>
  );
};

export default Timer;
