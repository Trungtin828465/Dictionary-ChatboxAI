import { Link } from "react-router-dom";
import Logo from "@/assets/icons/logo.svg?react";
import styles from "./styles.module.scss";

interface AuthHeaderProps {
  linkText: string;
  linkHref: string;
  description: string;
}

export function AuthHeader({
  linkText,
  linkHref,
  description,
}: AuthHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <Logo />
      </Link>
      <div className={styles.rightSection}>
        <span className={styles.description}>{description}</span>
        <Link to={linkHref} className={styles.link}>
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
