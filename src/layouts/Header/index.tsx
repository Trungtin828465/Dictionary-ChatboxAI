import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/icons/logo.svg?react";
import AccountIcon from "@/assets/icons/account.svg?react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "react-router-dom";
import HeaderLink from "@/components/headerlink";
import NullAbleComponent from "@/components/ui/NullAbleComponent";
import styles from "./styles.module.scss";

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Link to="/" className={styles.logo}>
          <Logo />
        </Link>
        <NullAbleComponent isNull={!user}>
          <div className={styles.navLinks}>
            <HeaderLink
              to="/my-vocab"
              text="My Vocab"
              currentPath={currentPath}
            />
            <HeaderLink
              to="/chatbox"
              text="Chatbox"
              currentPath={currentPath}
            />
            <HeaderLink
              to="/exams"
              text="Bộ đề thi tổng hợp"
              currentPath={currentPath}
            />
            <HeaderLink
              to="/translation"
              text="Dịch"
              currentPath={currentPath}
            />
          </div>
        </NullAbleComponent>
      </div>

      <NullAbleComponent isNull={!!user}>
        <div className={styles.authButtons}>
          <Link to="/sign-up" className={styles.signUpButton}>
            Đăng ký
          </Link>
          <Link to="/sign-in" className={styles.signInButton}>
            Đăng nhập
          </Link>
        </div>
      </NullAbleComponent>
      <NullAbleComponent isNull={!user}>
        <div className={styles.HeaderSignout}>
          <Link
            to="/sign-in"
            className={styles.signUpButton}
            onClick={handleSignOut}
          >
            Đăng xuất
          </Link>
          <div className={styles.HeaderAccount}>
            <p>{user?.username}</p>
            <AccountIcon />
          </div>
        </div>
      </NullAbleComponent>
    </header>
  );
}
