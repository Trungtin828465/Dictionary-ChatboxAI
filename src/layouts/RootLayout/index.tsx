import { Outlet } from "react-router-dom";
import { Footer } from "../Footer";
import { Header } from "../Header";
import BG from "@/assets/icons/bg.svg?react";
import styles from "./styles.module.scss";

export function RootLayout() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header />
        <main className={styles.main}>
          <div className={styles.mainContent}>
            <Outlet />
          </div>

          <div className={styles.backgroundWrapper}>
            <BG className={styles.background} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
