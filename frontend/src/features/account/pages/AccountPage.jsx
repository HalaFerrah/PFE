import { useNavigate } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";

function AccountPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("cash_user") || "{}");

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.accountTitle}</h1>
      <p className="hero-subtitle">{t.accountSubtitle}</p>

      <div className="quote-card register-card auth-card">
        <div className="card-toolbar">
          <BackNav to="/home" />
        </div>

        <div className="summary-block">
          <div className="summary-row">
            <span>{t.accountWelcome}</span>
            <strong>{user.first_name || "Client"}</strong>
          </div>
          <div className="summary-row">
            <span>{t.email}</span>
            <strong>{user.email || "-"}</strong>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <strong>Registered</strong>
          </div>
        </div>

        <button type="button" className="primary-btn strong-btn" onClick={() => navigate("/payment")}>
          {t.goToPayment}
        </button>
      </div>
    </section>
  );
}

export default AccountPage;
