import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import { useI18n } from "../../../i18n/I18nProvider";
import { useQuote } from "../QuoteContext";

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function InsuranceDurationPage() {
  const { t } = useI18n();
  const { quote, updateQuote } = useQuote();
  const navigate = useNavigate();
  const todayIso = toIsoDate(new Date());

  useEffect(() => {
    if (!quote.startDate || quote.startDate < todayIso) {
      updateQuote({ startDate: todayIso });
    }
  }, []);

  useEffect(() => {
    if (!quote.startDate) {
      return;
    }

    const start = new Date(quote.startDate);
    if (Number.isNaN(start.getTime())) {
      return;
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(quote.duration));
    const formatted = end.toISOString().slice(0, 10);
    if (formatted !== quote.endDate) {
      updateQuote({ endDate: formatted });
    }
  }, [quote.startDate, quote.duration]);

  const onNext = (event) => {
    event.preventDefault();
    navigate("/quote/boat");
  };

  const pickerOnlyHandlers = {
    onKeyDown: (event) => event.preventDefault(),
    onFocus: (event) => event.target.showPicker?.()
  };

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.joinTitle}</h1>
      <p className="hero-subtitle">{t.joinSubtitle}</p>

      <Stepper activeStep={1} />

      <form className="quote-card" onSubmit={onNext}>
        <div className="card-toolbar">
          <div />
        </div>

        <h2 className="card-heading">
          <span className="heading-dot">1</span>
          {t.durationCardTitle}
        </h2>
        <p className="card-subheading">{t.durationCardSubtitle}</p>

        <label className="label-text">{t.duration}</label>
        <div className="radio-list">
          {[
            { value: "3", label: t.months3 },
            { value: "6", label: t.months6 },
            { value: "12", label: t.year1 }
          ].map((item) => (
            <label className="radio-item" key={item.value}>
              <input
                type="radio"
                name="duration"
                value={item.value}
                checked={quote.duration === item.value}
                onChange={(e) => updateQuote({ duration: e.target.value })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <label className="label-text" htmlFor="startDate">
          {t.startDate}
        </label>
        <input
          id="startDate"
          className="input"
          type="date"
          value={quote.startDate}
          min={todayIso}
          onChange={(e) => {
            const value = e.target.value < todayIso ? todayIso : e.target.value;
            updateQuote({ startDate: value });
          }}
          required
          {...pickerOnlyHandlers}
        />

        <label className="label-text" htmlFor="endDate">
          {t.endDate}
        </label>
        <input
          id="endDate"
          className="input input-disabled"
          type="date"
          value={quote.endDate}
          min={todayIso}
          readOnly
          required
          {...pickerOnlyHandlers}
        />

        <div className="cta-row">
          <button type="submit" className="primary-btn">
            {t.next}
          </button>
        </div>
      </form>
    </section>
  );
}

export default InsuranceDurationPage;
