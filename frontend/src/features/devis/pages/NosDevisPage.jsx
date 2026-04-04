import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../../../components/ui/RevealOnScroll";
import { useI18n } from "../../../i18n/I18nProvider";

function NosDevisPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const boatImages = [
    "/download__59_-removebg-preview.png",
    "/download__60_-removebg-preview.png",
    "/Boat_Ship_PNG-removebg-preview.png"
  ];

  return (
    <section className="page-center info-page institutional-page">
      <RevealOnScroll>
        <section className="institutional-hero">
          <div className="institutional-copy">
            <p className="eyebrow">CASH Assurances</p>
            <h1 className="institutional-title">{t.devisTitle}</h1>
            <p className="institutional-subtitle">{t.devisSubtitle}</p>
            <p className="institutional-body">{t.devisLead}</p>
          </div>
          <div className="institutional-media subtle-accent-panel smooth-panel">
            <div className="process-strip">
              <div className="process-item smooth-card"><strong>01</strong><span>{t.devisCardText1}</span></div>
              <div className="process-item smooth-card"><strong>02</strong><span>{t.devisCardText2}</span></div>
              <div className="process-item smooth-card"><strong>03</strong><span>{t.devisCardText3}</span></div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-1">
        <section className="institutional-card-section">
          <div className="institutional-card-grid">
            <article className="institutional-card devis-offer-card smooth-card">
              <img src={boatImages[0]} alt="Anonymous simulation" className="institutional-card-image" />
              <h3>{t.devisOffer1}</h3>
              <p>{t.devisOfferText1}</p>
              <button type="button" className="header-link home-inline-link" onClick={() => navigate("/quote/duration")}>
                {t.startTest}
              </button>
            </article>
            <article className="institutional-card devis-offer-card highlighted-card smooth-card">
              <img src={boatImages[1]} alt="Complete quote" className="institutional-card-image" />
              <h3>{t.devisOffer2}</h3>
              <p>{t.devisOfferText2}</p>
              <button type="button" className="header-pill" onClick={() => navigate("/quote/duration")}>
                {t.homeCta}
              </button>
            </article>
            <article className="institutional-card devis-offer-card smooth-card">
              <img src={boatImages[2]} alt="Institutional presentation" className="institutional-card-image" />
              <h3>{t.devisOffer3}</h3>
              <p>{t.devisOfferText3}</p>
              <button type="button" className="header-link home-inline-link" onClick={() => navigate("/qui-sommes-nous")}>
                {t.aboutNav}
              </button>
            </article>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayClass="delay-2">
        <section className="institutional-split-section">
          <div className="dashboard-panel institutional-text-panel smooth-panel">
            <p className="eyebrow">{t.summary}</p>
            <h2>{t.devisOffer2}</h2>
            <p>{t.summaryText}</p>
          </div>
          <div className="dashboard-panel institutional-text-panel subtle-accent-panel smooth-panel">
            <p className="eyebrow">{t.secureQuote}</p>
            <h2>{t.devisOffer1}</h2>
            <p>{t.createAccountText}</p>
          </div>
        </section>
      </RevealOnScroll>
    </section>
  );
}

export default NosDevisPage;
