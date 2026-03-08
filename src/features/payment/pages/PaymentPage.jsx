import { useI18n } from "../../../i18n/I18nProvider";
import BackNav from "../../../components/ui/BackNav";

function PaymentPage() {
  const { t } = useI18n();

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.payment}</h1>
      <p className="hero-subtitle">{t.paymentText}</p>

      <div className="quote-card register-card auth-card">
        <div className="card-toolbar">
          <BackNav to="/register" />
        </div>

        <div className="summary-block">
          <div className="summary-row">
            <span>Card</span>
            <strong>**** **** **** 4242</strong>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <strong>Pending</strong>
          </div>
          <div className="summary-row">
            <span>Provider</span>
            <strong>CIB / Edahabia</strong>
          </div>
        </div>

        <button type="button" className="primary-btn strong-btn">
          {t.payNow}
        </button>
      </div>
    </section>
  );
}

export default PaymentPage;
