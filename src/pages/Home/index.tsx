import BOOKMARK from "@/assets/icons/bookmark.svg?react";
import CHATBOX from "@/assets/icons/chatbox.svg?react";
import MAN_BG from "@/assets/icons/man_bg.svg?react";
import EXAMS from "@/assets/icons/exams.svg?react";
import TRANSLATION from "@/assets/icons/translation.svg?react";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = (search: string) => {
    if (search) {
      navigate(`/dictionary?word=${search}`, {
        state: {
          previousPath: window.location.pathname,
        },
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className="relative">
        <h1 className={styles.title}>Tra cứu từ vựng</h1>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Illustration */}
        <div className={styles.illustration}>
          <MAN_BG />
        </div>

        {/* Quote */}
        <p className={styles.quote}>
          <span>"Nothing</span> is impossible"
        </p>
      </div>

      {/* Feature Cards */}
      <div className={styles.featureGrid}>
        <Link to="/my-vocab">
          <Card className={styles.featureCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <BOOKMARK />
              </div>
              <h2 className={styles.cardTitle}>Từ vựng của tôi</h2>
              <p className={styles.cardDescription}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/chatbox">
          <Card className={styles.featureCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <CHATBOX />
              </div>
              <h2 className={styles.cardTitle}>Chatbox</h2>
              <p className={styles.cardDescription}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/exams">
          <Card className={styles.featureCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <EXAMS />
              </div>
              <h2 className={styles.cardTitle}>Bộ đề thi tổng hợp</h2>
              <p className={styles.cardDescription}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/translation">
          <Card className={styles.featureCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <TRANSLATION />
              </div>
              <h2 className={styles.cardTitle}>Dịch thuật</h2>
              <p className={styles.cardDescription}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/picture">
          <Card className={styles.featureCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <TRANSLATION />
              </div>
              <h2 className={styles.cardTitle}>Picture</h2>
              <p className={styles.cardDescription}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
