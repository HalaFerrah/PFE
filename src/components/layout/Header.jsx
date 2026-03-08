import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";

function Header() {
  const { t, toggleLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginActive = location.pathname === "/login";
  const isTestActive = location.pathname.startsWith("/quote/");

  return (
    <header className="topbar-wrap">
      <div className="topbar-content premium-header">
        <div className="header-left">
          <button className="brand-block brand-btn" type="button" onClick={() => navigate("/")}>
            <img src="/logo-2021.png" alt="CASH Assurance" />
          </button>
        </div>

        <div className="header-actions premium-actions">
          <button
            type="button"
            className={`header-link ${isLoginActive ? "is-active" : ""}`}
            onClick={() => navigate("/login")}
          >
            {t.login}
          </button>
          <button
            type="button"
            className={`header-pill ${isTestActive ? "is-active" : ""}`}
            onClick={() => navigate("/quote/duration")}
          >
            {t.test}
          </button>
          <button type="button" className="lang-btn" onClick={toggleLanguage}>
            {t.lang}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
