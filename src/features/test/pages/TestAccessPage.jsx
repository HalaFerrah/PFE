import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nProvider";

function TestAccessPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.testTitle}</h1>
      <p className="hero-subtitle">{t.testSubtitle}</p>

      <div className="quote-card register-card auth-card">
        <div className="summary-block">
          <div className="summary-row">
            <span>Access</span>
            <strong>Guest user</strong>
          </div>
          <div className="summary-row">
            <span>Flow</span>
            <strong>3 quote steps then registration</strong>
          </div>
        </div>

        <button type="button" className="primary-btn strong-btn" onClick={() => navigate("/quote/duration")}>
          {t.startTest}
        </button>
      </div>
    </section>
  );
}

export default TestAccessPage;
