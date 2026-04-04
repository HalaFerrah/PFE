import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../../../components/ui/RevealOnScroll";
import { useI18n } from "../../../i18n/I18nProvider";

function handleGlowMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function AboutPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const boatImages = [
    "/Boat_Ship_PNG-removebg-preview.png",
    "/download__59_-removebg-preview.png"
  ];

  return (
    <section className="page-center info-page institutional-page about-page-premium">
      <RevealOnScroll>
        <section className="about-showcase">
          <div className="about-showcase-copy cursor-glow-card" onMouseMove={handleGlowMove}>
            <p className="eyebrow">CASH Assurances</p>
            <h1 className="about-showcase-title">{t.aboutTitle}</h1>
            <p className="about-showcase-subtitle">{t.aboutSubtitle}</p>
            <p className="about-showcase-text">{t.aboutLead}</p>
            <div className="about-showcase-actions">
              <button type="button" className="primary-btn strong-btn home-cta" onClick={() => navigate("/quote/duration")}>
                {t.homeCta}
              </button>
              <button type="button" className="header-link" onClick={() => navigate("/nos-devis")}>
                {t.quotesNav}
              </button>
            </div>
          </div>

          <div className="about-showcase-visual">
            <div className="about-visual-frame float-soft">
              <img src={boatImages[0]} alt="Boat protection" className="institutional-image" />
            </div>
            <div className="about-stat-stack">
              <div className="about-stat-card glow-card cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutStat1}</strong>
                <span>{t.aboutStat1Text}</span>
              </div>
              <div className="about-stat-card glow-card cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutStat2}</strong>
                <span>{t.aboutStat2Text}</span>
              </div>
              <div className="about-stat-card glow-card cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutStat3}</strong>
                <span>{t.aboutStat3Text}</span>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-1">
        <section className="about-dual-band">
          <article className="about-story-card cursor-glow-card" onMouseMove={handleGlowMove}>
            <p className="eyebrow">{t.aboutMissionTitle}</p>
            <h2>{t.aboutMissionTitle}</h2>
            <p>{t.aboutMissionText}</p>
          </article>
          <article className="about-story-card accent-story-card cursor-glow-card" onMouseMove={handleGlowMove}>
            <p className="eyebrow">{t.aboutVisionTitle}</p>
            <h2>{t.aboutVisionTitle}</h2>
            <p>{t.aboutVisionText}</p>
          </article>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-2">
        <section className="about-focus-grid compact-about-grid tiled-about-grid">
          <div className="about-tiles-column">
            <div className="about-mini-tile about-intro-tile cursor-glow-card" onMouseMove={handleGlowMove}>
              <p className="eyebrow">{t.aboutValuesLabel}</p>
              <h2>{t.aboutValuesTitle}</h2>
              <p>{t.aboutValuesText}</p>
            </div>
            <div className="about-mini-grid">
              <div className="about-mini-tile cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutCard1}</strong>
                <span>{t.aboutCardText1}</span>
              </div>
              <div className="about-mini-tile cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutCard2}</strong>
                <span>{t.aboutCardText2}</span>
              </div>
              <div className="about-mini-tile cursor-glow-card" onMouseMove={handleGlowMove}>
                <strong>{t.aboutCard3}</strong>
                <span>{t.aboutCardText3}</span>
              </div>
            </div>
          </div>

          <div className="about-side-visual subtle-accent-panel cursor-glow-card" onMouseMove={handleGlowMove}>
            <img src={boatImages[1]} alt="Marine identity" className="institutional-image small-image" />
            <div className="about-side-note">
              <strong>{t.aboutCtaTitle}</strong>
              <span>{t.aboutCtaText}</span>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </section>
  );
}

export default AboutPage;
