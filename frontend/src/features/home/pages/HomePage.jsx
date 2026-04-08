import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../../../components/ui/RevealOnScroll";
import { useI18n } from "../../../i18n/I18nProvider";

function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const boatImages = [
    "/Boat_Ship_PNG-removebg-preview.png",
    "/download__59_-removebg-preview.png",
    "/download__60_-removebg-preview.png"
  ];

  return (
    <section className="page-center home-page institutional-page">
      <RevealOnScroll>
        <section className="institutional-hero">
          <div className="institutional-copy">
            <h1 className="institutional-title">{t.homeTitle}</h1>
            <p className="institutional-subtitle">{t.homeSubtitle}</p>
            <div className="home-action-row">
              <button type="button" className="primary-btn strong-btn home-cta" onClick={() => navigate("/quote/duration")}>
                {t.homeCta}
              </button>
              <button type="button" className="header-link home-secondary-btn" onClick={() => navigate("/qui-sommes-nous")}>
                {t.aboutNav}
              </button>
            </div>
          </div>
          <div className="institutional-media institutional-media-accent smooth-panel">
            <img src={boatImages[0]} alt="Boat insurance" className="institutional-image" />
            <div className="institutional-stats-row">
              <div className="smooth-card"><strong>{t.homeBadge1}</strong><span>{t.homeCardText1}</span></div>
              <div className="smooth-card"><strong>{t.homeBadge2}</strong><span>{t.homeCardText2}</span></div>
              <div className="smooth-card"><strong>{t.homeBadge3}</strong><span>{t.homeCardText3}</span></div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-1">
        <section className="institutional-split-section">
          <div className="institutional-text-panel dashboard-panel smooth-panel">
            <h2>{t.homeSectionTitle}</h2>
            <p>{t.homeSectionText}</p>
            <div className="institutional-list">
              <div className="institutional-list-item"><strong>{t.homePanelTitle}</strong><span>{t.homePanelText}</span></div>
              <div className="institutional-list-item"><strong>{t.homeStoryTitle}</strong><span>{t.homeStoryText}</span></div>
            </div>
          </div>
          <div className="institutional-image-panel dashboard-panel smooth-panel">
            <img src={boatImages[1]} alt="Marine insurance" className="institutional-image small-image" />
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-2">
        <section className="institutional-card-section">
          <div className="section-heading-block institutional-heading-left">
            <h2>{t.homeQuoteTitle}</h2>
            <p>{t.homeQuoteText}</p>
          </div>
          <div className="institutional-card-grid">
            <article className="institutional-card smooth-card">
              <img src={boatImages[1]} alt="Fast simulation" className="institutional-card-image" />
              <h3>{t.homeCard1}</h3>
              <p>{t.homeCardText1}</p>
            </article>
            <article className="institutional-card highlighted-card smooth-card">
              <img src={boatImages[2]} alt="Flexible guarantees" className="institutional-card-image" />
              <h3>{t.homeCard2}</h3>
              <p>{t.homeCardText2}</p>
            </article>
            <article className="institutional-card smooth-card">
              <img src={boatImages[0]} alt="Secure subscription" className="institutional-card-image" />
              <h3>{t.homeCard3}</h3>
              <p>{t.homeCardText3}</p>
            </article>
          </div>
        </section>
      </RevealOnScroll>
    </section>
  );
}

export default HomePage;
