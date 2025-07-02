import { Link } from "react-router-dom";
import styles from "./styles.module.scss";

type HeaderLinkProps = {
  to: string;
  text: string;
  currentPath: string;
};

const HeaderLink = ({ to, text, currentPath }: HeaderLinkProps) => {
  return (
    <Link
      to={to}
      className={`${styles.headerLink} ${currentPath.includes(to) ? styles.active : ""}`}
    >
      {text}
    </Link>
  );
};

export default HeaderLink;
