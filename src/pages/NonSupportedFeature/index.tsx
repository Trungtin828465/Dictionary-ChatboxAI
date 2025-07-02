import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import { ArrowLeft } from "lucide-react";
import AuthBackground from "@/assets/icons/auth_bg.svg?react";

const NonSupportedFeature = () => {
  return (
    <div className={styles.authContent}>
      <Link to="/" className={styles.backLink}>
        <ArrowLeft />
        <span>Home</span>
      </Link>
      <div className={styles.messageContainer}>
        <div className={styles.illustration}>
          <AuthBackground />
        </div>
        <div className={styles.messageContent}>
          <h1 className={styles.messageTitle}>Chức năng này cần đăng nhập</h1>
          <p className={styles.messageDescription}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s,
          </p>
        </div>
      </div>
    </div>
  );
};

export default NonSupportedFeature;
