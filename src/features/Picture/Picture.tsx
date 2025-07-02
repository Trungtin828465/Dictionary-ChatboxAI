import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Picture/style.css";

type Proficiency = {
  id: string;
  name: string;
  band: string;
  description: string;
};

const BASE_URL = import.meta.env.VITE_BE_API_URL;

function Picture() {
  const [proficiencies, setProficiencies] = useState<Proficiency[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProficiencies = async () => {
      try {
        const response = await fetch(`${BASE_URL}api/Proficiency/Proficiency`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Proficiency[] = await response.json();
        setProficiencies(data);
      } catch (error) {
        console.error("Error fetching proficiencies:", error);
        setError("Failed to load proficiencies");
        setProficiencies(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProficiencies();
  }, []);

  const navigate = useNavigate();

  const handleProficiencyClick = (proficiency: Proficiency) => {
    sessionStorage.setItem("proficiencyId", proficiency.id);
    sessionStorage.setItem("proficiencyName", proficiency.name);
    navigate("/topic");
  };

  return (
    <div className="picture-container">
      <section className="header-section">
        <h2 className="main-title">TỔNG HỢP BỘ ĐỀ PICTURE</h2>
        <div className="levels-grid">
          {loading ? (
            <p className="loading">Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : proficiencies ? (
            proficiencies.map((proficiency) => (
              <button
                key={proficiency.id}
                className="level-card"
                onClick={() => handleProficiencyClick(proficiency)}
              >
                <div className="proficiency-info">
                  <p>Band: {proficiency.band}</p>
                  <h3>{proficiency.name}</h3>
                </div>
              </button>
            ))
          ) : (
            <p className="error">Không có dữ liệu hiển thị.</p>
          )}
        </div>
      </section>

      <section className="message-section">
        <h2 className="welcome-message">
          Welcome to our English class! Let&apos;s learn with pictures and have
          fun!
        </h2>
      </section>
    </div>
  );
}

export default Picture;
