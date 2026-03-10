import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nProvider";

function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <section className="page-center home-page">
      <div className="home-hero">
        <div className="home-copy">
          <h1 className="hero-title">{t.homeTitle}</h1>
          <p className="hero-subtitle">{t.homeSubtitle}</p>
          <button type="button" className="primary-btn strong-btn home-cta" onClick={() => navigate("/quote/duration")}>
            {t.homeCta}
          </button>
        </div>
        <img src="/boats/boat-1.svg" alt="Boat insurance" className="home-main-image" />
      </div>

      <div className="home-grid">
        <article className="home-card">
          <img src="/boats/boat-2.svg" alt="Fast simulation" />
          <h3>{t.homeCard1}</h3>
        </article>
        <article className="home-card">
          <img src="/boats/boat-3.svg" alt="Flexible guarantees" />
          <h3>{t.homeCard2}</h3>
        </article>
        <article className="home-card">
          <img src="/boats/boat-1.svg" alt="Secure subscription" />
          <h3>{t.homeCard3}</h3>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
