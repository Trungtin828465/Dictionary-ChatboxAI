import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Footer } from "@/layouts/Footer";
import BG from "@/assets/icons/bg.svg?react";
import TABLET_BG from "@/assets/icons/tablet_login.svg?react";
import styles from "./styles.module.scss";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AuthHeader
          linkText="Đăng nhập"
          linkHref="/sign-in"
          description="Đã có tài khoản?"
        />
        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Form Section */}
            <div className={styles.formSection}>
              <SignUpForm />
            </div>
            <div className={styles.illustration}>
              <TABLET_BG />
            </div>
          </div>
          <div className={styles.background}>
            <BG />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
