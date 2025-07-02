import { Button } from "@/components/ui/button";
import GG from "@/assets/icons/gg.svg?react";
import styles from "./styles.module.scss";

export function SocialLoginButton({
  onGoogleSignIn,
}: {
  onGoogleSignIn: () => void;
}) {
  return (
    <div className={styles.container}>
      <Button
        variant="outline"
        className={styles.button}
        onClick={onGoogleSignIn}
      >
        <p className={styles.buttonText}>
          Đăng nhập với Google{" "}
          <span className={styles.iconGroup}>
            <GG className={styles.icon} />
          </span>
        </p>
      </Button>
    </div>
  );
}
