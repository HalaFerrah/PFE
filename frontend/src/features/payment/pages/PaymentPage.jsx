import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nProvider";
import BackNav from "../../../components/ui/BackNav";
import { createContract } from "../../../api/client";

function PaymentPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const token = localStorage.getItem("cash_token");
  const snapshot = JSON.parse(localStorage.getItem("cash_quote_snapshot") || "{}");
  const boatId = localStorage.getItem("cash_last_boat_id") || "";
  const [paymentMethod, setPaymentMethod] = useState("CIB");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCount = useMemo(() => (snapshot.selectedGuarantees || []).length + 1, [snapshot]);

  const onPay = async () => {
    if (!token || !boatId) {
      setError(t.paymentMissing);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await createContract(token, {
        boat_id: Number(boatId),
        contract_duration: snapshot.duration,
        start_date: snapshot.startDate,
        guarantee_codes: snapshot.selectedGuarantees || [],
        payment_method: paymentMethod
      });
      localStorage.setItem("cash_last_contract_id", String(response.data.contract_id));
      navigate(`/contracts/${response.data.contract_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.payment}</h1>
      <p className="hero-subtitle">{t.paymentText}</p>

      <div className="quote-card register-card auth-card">
        <div className="card-toolbar">
          <BackNav to="/account" />
        </div>

        <div className="summary-block">
          <div className="summary-row">
            <span>{t.boatName}</span>
            <strong>{snapshot.boatName || "-"}</strong>
          </div>
          <div className="summary-row">
            <span>{t.duration}</span>
            <strong>{snapshot.duration || "-"}</strong>
          </div>
          <div className="summary-row">
            <span>{t.guaranteeCount}</span>
            <strong>{selectedCount}</strong>
          </div>
          <div className="summary-row">
            <span>{t.totalPrice}</span>
            <strong>{Number(snapshot.estimatedPrice || 0).toLocaleString()} DA</strong>
          </div>
        </div>

        <div className="radio-list">
          {["CIB", "Dahabia"].map((method) => (
            <label className="radio-item" key={method}>
              <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span>{method}</span>
            </label>
          ))}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="button" className="primary-btn strong-btn" onClick={onPay} disabled={loading}>
          {loading ? t.loadingText : t.payNow}
        </button>
      </div>
    </section>
  );
}

export default PaymentPage;
