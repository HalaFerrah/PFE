import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { useQuote } from "../QuoteContext";

const photoFields = [
  "photo_main",
  "photo_front",
  "photo_rear",
  "photo_interior",
  "photo_engine",
  "photo_hull"
];

function BoatDetailsPage() {
  const { t } = useI18n();
  const { quote, updateQuote, runCalculation } = useQuote();
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    updateQuote({ [key]: value });
  };

  const handleFileChange = (key, file) => {
    updateQuote({ [key]: file || null });
  };

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

        <div className="inline-row">
          <label>{t.boatId}</label>
          <input
            className="input input-small"
            type="text"
            placeholder={t.boatId}
            value={quote.boatId}
            onChange={(e) => handleChange("boatId", e.target.value)}
            required
          />
        </div>

        <input
          className="input"
          type="text"
          placeholder={t.boatName}
          value={quote.boatName}
          onChange={(e) => handleChange("boatName", e.target.value)}
          required
        />

        <div className="floating-select">
          {!quote.type ? <span className="select-holder">{t.type}</span> : null}
          <select className="input floating-select-input" value={quote.type} onChange={(e) => handleChange("type", e.target.value)} required>
            <option value="" disabled hidden></option>
            <option value="sail">{t.boatTypes.sail}</option>
            <option value="motor">{t.boatTypes.motor}</option>
          </select>
        </div>

        <div className="inline-row">
          <label>{t.power}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="1"
            value={quote.power}
            onChange={(e) => handleChange("power", e.target.value)}
            required
          />
        </div>

        <div className="inline-row">
          <label>{t.yearConstruction}</label>
          <input
            className="input input-small"
            type="number"
            min="1950"
            max="2100"
            step="1"
            value={quote.yearConstruction}
            onChange={(e) => handleChange("yearConstruction", e.target.value)}
            required
          />
        </div>

        <div className="floating-select">
          {!quote.material ? <span className="select-holder">{t.material}</span> : null}
          <select className="input floating-select-input" value={quote.material} onChange={(e) => handleChange("material", e.target.value)} required>
            <option value="" disabled hidden></option>
            <option value="steel">{t.materials.steel}</option>
            <option value="wood">{t.materials.wood}</option>
            <option value="polystyrene">{t.materials.polystyrene}</option>
            <option value="pneumatic">{t.materials.pneumatic}</option>
          </select>
        </div>

        <div className="inline-row">
          <label>{t.grossTonnage}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="0.01"
            value={quote.grossTonnage}
            onChange={(e) => handleChange("grossTonnage", e.target.value)}
            required
          />
        </div>

        <div className="inline-row">
          <label>{t.length}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="0.01"
            value={quote.length}
            onChange={(e) => handleChange("length", e.target.value)}
            required
          />
        </div>

        <div className="inline-row">
          <label>{t.width}</label>
          <input
            className="input input-small"
            type="number"
            min="0"
            step="0.01"
            value={quote.width}
            onChange={(e) => handleChange("width", e.target.value)}
            required
          />
        </div>

        <div className="inline-row amount-row">
          <label>{t.amount}</label>
          <input
            className="input input-small amount-input"
            type="number"
            min="0"
            step="0.01"
            value={quote.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            placeholder="00 DA"
            required
          />
        </div>

        <div className="upload-section">
          <div className="upload-section-header">
            <h3>{t.boatPhotos}</h3>
            <p>{t.boatPhotosText}</p>
          </div>
          <div className="upload-grid">
            {photoFields.map((field) => (
              <label key={field} className="upload-card">
                <span className="upload-label">{t.photoLabels[field]}</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(field, e.target.files?.[0])} />
                {quote[field]?.name ? <span className="upload-file-name">{quote[field].name}</span> : null}
              </label>
            ))}
          </div>
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
