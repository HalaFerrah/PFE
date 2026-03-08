import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { useQuote } from "../QuoteContext";

const OPTIONAL_ITEMS = ["theft", "fire", "natural", "towing", "crew"];

function GuaranteeCalculationPage() {
  const { t } = useI18n();
  const { quote, toggleGuarantee } = useQuote();
  const navigate = useNavigate();

  const durationLabel = quote.duration === "12" ? t.year1 : quote.duration === "6" ? t.months6 : t.months3;
  const mandatoryValue = Math.round((quote.amount || 0) * 0.18);
  const optionalValue = Math.max(0, (quote.estimatedPrice || 0) - Math.round((quote.amount || 0) * (quote.duration === "12" ? 1.8 : quote.duration === "6" ? 1.25 : 1)) - mandatoryValue);

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.joinTitle}</h1>
      <p className="hero-subtitle">{t.joinSubtitle}</p>

      <Stepper activeStep={3} />

      <div className="quote-card quote-card-empty">
        <div className="card-toolbar">
          <BackNav to="/quote/boat" />
        </div>

        <h2 className="card-heading">
          <span className="heading-dot">3</span>
          {t.summary}
        </h2>
        <p className="card-subheading">{t.summaryText}</p>

        <div className="guarantee-section">
          <h3>{t.mandatoryGuarantee}</h3>
          <label className="guarantee-item mandatory">
            <input type="checkbox" checked readOnly />
            <span>{t.guarantees.liability}</span>
            <strong>{mandatoryValue} DA</strong>
          </label>

          <h3>{t.optionalGuarantees}</h3>
          <div className="guarantee-list">
            {OPTIONAL_ITEMS.map((itemKey) => {
              const isChecked = quote.selectedGuarantees.includes(itemKey);
              return (
                <label className="guarantee-item" key={itemKey}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleGuarantee(itemKey)} />
                  <span>{t.guarantees[itemKey]}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="summary-block premium-summary">
          <div className="summary-row">
            <span>{t.boatName}</span>
            <strong>{quote.boatName || "-"}</strong>
          </div>
          <div className="summary-row">
            <span>{t.duration}</span>
            <strong>{durationLabel}</strong>
          </div>
          <div className="summary-row">
            <span>{t.amount}</span>
            <strong>{quote.amount || 0} DA</strong>
          </div>
          <div className="summary-row">
            <span>{t.mandatoryGuarantee}</span>
            <strong>{mandatoryValue} DA</strong>
          </div>
          <div className="summary-row">
            <span>{t.optionalGuarantees}</span>
            <strong>{optionalValue} DA</strong>
          </div>
          <div className="summary-row price-row">
            <span>{t.finalCalculation}</span>
            <strong>{quote.estimatedPrice || 0} DA</strong>
          </div>
        </div>

        <button type="button" className="primary-btn strong-btn" onClick={() => navigate("/register")}>
          {t.continueRegister}
        </button>
      </div>
    </section>
  );
}

export default GuaranteeCalculationPage;
