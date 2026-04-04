import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../../components/ui/Stepper";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { createBoat, simulatePremium } from "../../../api/client";
import { useQuote } from "../QuoteContext";

const MAIN_GUARANTEES = ["34141A"];
const COMPLEMENTARY_GUARANTEES = ["34142A", "34142B", "34142C", "34142D"];

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

function toBackendMaterial(material) {
  if (material === "steel") return "steel";
  if (material === "wood") return "wood";
  if (material === "pneumatic") return "inflatable";
  return "polyester";
}

function toBackendType(type) {
  return type === "sail" ? "sailboat" : "motorboat";
}

function GuaranteeCalculationPage() {
  const { t } = useI18n();
  const { quote, toggleGuarantee, updateQuote } = useQuote();
  const navigate = useNavigate();
  const token = localStorage.getItem("cash_token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const durationLabel = quote.duration === "1_year" ? t.year1 : quote.duration === "6_months" ? t.months6 : t.months3;
  const premiumData = quote.premiumDetails;
  const mandatoryValue = premiumData?.garantie_principale?.prime || 0;
  const optionalValue = useMemo(() => {
    if (!premiumData?.garanties_complementaires) return 0;
    return premiumData.garanties_complementaires.reduce((sum, item) => sum + Number(item.prime || 0), 0);
  }, [premiumData]);

  useEffect(() => {
    if (!quote.amount || !quote.yearConstruction || !quote.type || !quote.duration) {
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    simulatePremium({
      total_insured_value: Number(quote.amount || 0),
      construction_year: Number(quote.yearConstruction || 0),
      boat_type: quote.type === "sail" ? "sailboat" : "motorboat",
      contract_duration: quote.duration,
      guarantee_codes: quote.selectedGuarantees
    })
      .then((response) => {
        if (!active) return;
        updateQuote({
          premiumDetails: response.data,
          estimatedPrice: Number(response.data?.prime_totale_ttc || 0)
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        updateQuote({ premiumDetails: null, estimatedPrice: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quote.amount, quote.yearConstruction, quote.type, quote.duration, quote.selectedGuarantees, updateQuote]);

  const persistQuoteSnapshot = () => {
    localStorage.setItem("cash_quote_snapshot", JSON.stringify({
      duration: quote.duration,
      startDate: quote.startDate,
      endDate: quote.endDate,
      selectedGuarantees: quote.selectedGuarantees,
      estimatedPrice: quote.estimatedPrice,
      amount: quote.amount,
      boatName: quote.boatName
    }));
  };

  const createBoatForLoggedInUser = async () => {
    const boatForm = new FormData();
    boatForm.append("boat_name", quote.boatName || "Boat");
    boatForm.append("boat_type", toBackendType(quote.type));
    boatForm.append("engine_power_hp", String(Number(quote.power || 0)));
    boatForm.append("construction_year", String(Number(quote.yearConstruction || 2020)));
    boatForm.append("construction_materials", toBackendMaterial(quote.material));
    boatForm.append("gross_tonnage", String(Number(quote.grossTonnage || 0)));
    boatForm.append("length_m", String(Number(quote.length || 0)));
    boatForm.append("beam_width_m", String(Number(quote.width || 0)));
    boatForm.append("total_insured_value", String(Number(quote.amount || 0)));
    boatForm.append("registration_number", quote.boatId || "TEMP-REG");
    boatForm.append("home_port", "Alger");

    ["photo_main", "photo_front", "photo_rear", "photo_interior", "photo_engine", "photo_hull"].forEach((field) => {
      if (quote[field]) {
        boatForm.append(field, quote[field]);
      }
    });

    const boatResponse = await createBoat(token, boatForm);
    const boatId = boatResponse?.data?.id;
    if (boatId) {
      localStorage.setItem("cash_last_boat_id", String(boatId));
    }
  };

  const handleContinue = async () => {
    if (!token) {
      navigate("/register");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createBoatForLoggedInUser();
      persistQuoteSnapshot();
      navigate("/payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-center reveal rise-in">
      <h1 className="hero-title">{t.joinTitle}</h1>
      <p className="hero-subtitle">{t.joinSubtitle}</p>

      <Stepper activeStep={3} />

      <div className="quote-card quote-card-empty smooth-panel">
        <div className="card-toolbar">
          <BackNav to="/quote/boat" />
        </div>

        <h2 className="card-heading">
          <span className="heading-dot">3</span>
          {t.summary}
        </h2>
        <p className="card-subheading">{t.summaryText}</p>

        <div className="guarantee-section smooth-panel">
          <h3>{t.mandatoryGuarantee}</h3>
          <label className="guarantee-item mandatory smooth-card">
            <input type="checkbox" checked readOnly />
            <span>{t.guarantees.fixed}</span>
          </label>

          <h3>{t.principalGuarantees}</h3>
          <div className="guarantee-list">
            {MAIN_GUARANTEES.map((itemKey) => (
              <label className="guarantee-item mandatory smooth-card" key={itemKey}>
                <input type="checkbox" checked readOnly />
                <span>{t.guarantees[itemKey]}</span>
                <strong>{formatMoney(mandatoryValue)}</strong>
              </label>
            ))}
          </div>

          <h3>{t.complementaryGuarantees}</h3>
          <div className="guarantee-list">
            {COMPLEMENTARY_GUARANTEES.map((itemKey) => {
              const isChecked = quote.selectedGuarantees.includes(itemKey);
              return (
                <label className="guarantee-item smooth-card" key={itemKey}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleGuarantee(itemKey)} />
                  <span>{t.guarantees[itemKey]}</span>
                </label>
              );
            })}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="summary-block premium-summary smooth-panel">
          <div className="summary-row"><span>{t.boatName}</span><strong>{quote.boatName || "-"}</strong></div>
          <div className="summary-row"><span>{t.duration}</span><strong>{durationLabel}</strong></div>
          <div className="summary-row"><span>{t.amount}</span><strong>{formatMoney(quote.amount)}</strong></div>
          <div className="summary-row"><span>{t.boatTypeLabel}</span><strong>{premiumData?.type_navire || (quote.type === "sail" ? "sailboat" : "motorboat")}</strong></div>
          <div className="summary-row"><span>{t.boatAgeLabel}</span><strong>{premiumData?.age_navire ?? "-"}</strong></div>
          <div className="summary-row"><span>{t.mainNetPremium}</span><strong>{formatMoney(mandatoryValue)}</strong></div>
          <div className="summary-row"><span>{t.optionalGuarantees}</span><strong>{formatMoney(optionalValue)}</strong></div>
          <div className="summary-row"><span>{t.totalNetPremium}</span><strong>{formatMoney(premiumData?.prime_nette_totale || 0)}</strong></div>
          <div className="summary-row"><span>{t.durationCoefficient}</span><strong>{premiumData?.coefficient_duree ?? "-"}</strong></div>
          <div className="summary-row"><span>{t.adjustedNetPremium}</span><strong>{formatMoney(premiumData?.prime_nette_ajustee || 0)}</strong></div>
          <div className="summary-row"><span>{t.taxLabel}</span><strong>{formatMoney(premiumData?.taxe_7pct || 0)}</strong></div>
          <div className="summary-row"><span>{t.stampDuty}</span><strong>{formatMoney(premiumData?.droit_timbre || 0)}</strong></div>
          <div className="summary-row price-row"><span>{t.finalCalculation}</span><strong>{loading ? t.calculating : formatMoney(quote.estimatedPrice || 0)}</strong></div>
        </div>

        <button type="button" className="primary-btn strong-btn" onClick={handleContinue} disabled={loading || !!error || !quote.estimatedPrice}>
          {loading ? t.calculating : token ? t.goToPayment : t.continueRegister}
        </button>
      </div>
    </section>
  );
}

export default GuaranteeCalculationPage;
