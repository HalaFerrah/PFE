import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { calculateAmount, useQuote } from "../QuoteContext";

function BoatDetailsPage() {
  const { t } = useI18n();
  const { quote, updateQuote, runCalculation } = useQuote();
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    updateQuote({ [key]: value });
  };

  useEffect(() => {
    const computedAmount = calculateAmount(quote);
    if (computedAmount !== quote.amount) {
      updateQuote({ amount: computedAmount });
    }
  }, [quote.type, quote.power, quote.yearConstruction, quote.material, quote.grossTonnage, quote.length, quote.width]);

  const onNext = (event) => {
    event.preventDefault();
    runCalculation();
    navigate("/quote/guarantee");
  };

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.joinTitle}</h1>
      <p className="hero-subtitle">{t.joinSubtitle}</p>

      <Stepper activeStep={2} />

      <form className="quote-card" onSubmit={onNext}>
        <div className="card-toolbar">
          <BackNav to="/quote/duration" />
        </div>

        <h2 className="card-heading">
          <span className="heading-dot">2</span>
          {t.descCardTitle}
        </h2>
        <p className="card-subheading">{t.descCardSubtitle}</p>

        <input
          className="input"
          type="text"
          placeholder={t.boatName}
          value={quote.boatName}
          onChange={(e) => handleChange("boatName", e.target.value)}
        />

        <select className="input" value={quote.type} onChange={(e) => handleChange("type", e.target.value)}>
          <option value="">{t.type}</option>
          <option value="sailboat">Sailboat</option>
          <option value="motorboat">Motorboat</option>
          <option value="yacht">Yacht</option>
        </select>

        <div className="inline-row">
          <label>{t.power}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            value={quote.power}
            onChange={(e) => handleChange("power", e.target.value)}
          />
        </div>

        <div className="inline-row">
          <label>{t.yearConstruction}</label>
          <input
            className="input input-small"
            type="number"
            min="1950"
            max="2100"
            value={quote.yearConstruction}
            onChange={(e) => handleChange("yearConstruction", e.target.value)}
          />
        </div>

        <select className="input" value={quote.material} onChange={(e) => handleChange("material", e.target.value)}>
          <option value="">{t.material}</option>
          <option value="wood">Wood</option>
          <option value="steel">Steel</option>
          <option value="aluminium">Aluminium</option>
          <option value="composite">Composite</option>
        </select>

        <div className="inline-row">
          <label>{t.grossTonnage}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            value={quote.grossTonnage}
            onChange={(e) => handleChange("grossTonnage", e.target.value)}
          />
        </div>

        <div className="inline-row">
          <label>{t.length}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="0.1"
            value={quote.length}
            onChange={(e) => handleChange("length", e.target.value)}
          />
        </div>

        <div className="inline-row">
          <label>{t.width}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="0.1"
            value={quote.width}
            onChange={(e) => handleChange("width", e.target.value)}
          />
        </div>

        <div className="inline-row amount-row">
          <label>{t.amount}</label>
          <input className="input input-small amount-input" type="text" value={`${quote.amount || 0} DA`} readOnly />
        </div>

        <div className="cta-row">
          <button type="submit" className="primary-btn">
            {t.next}
          </button>
        </div>
      </form>
    </section>
  );
}

export default BoatDetailsPage;
