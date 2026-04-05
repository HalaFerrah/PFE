import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";

function Header() {
  const { t, toggleLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("cash_user") || "{}");
  const isLoggedIn = Boolean(user.id);
  const isAdmin = user.role === "admin" || user.role === "agent";

  const isHomeActive = location.pathname === "/home";
  const isAboutActive = location.pathname === "/qui-sommes-nous";
  const isQuotesActive = location.pathname === "/nos-devis";
  const isLoginActive = location.pathname === "/login";
  const isTestActive = location.pathname.startsWith("/quote/");
  const isDashboardActive = location.pathname.startsWith(isAdmin ? "/admin" : "/account") || location.pathname.startsWith("/contracts/");

  return (
    <header className="topbar-wrap">
      <div className="topbar-content premium-header">
        <div className="header-left">
          <button className="brand-block brand-btn" type="button" onClick={() => navigate("/home")}>
            <img src="/logo-2021.png" alt="CASH Assurance" />
          </button>
        </div>

        <div className="header-actions premium-actions nav-rich-actions">
          <button type="button" className={`header-link ${isHomeActive ? "is-active" : ""}`} onClick={() => navigate("/home")}>
            {t.home}
          </button>
          <button type="button" className={`header-link ${isAboutActive ? "is-active" : ""}`} onClick={() => navigate("/qui-sommes-nous")}>
            {t.aboutNav}
          </button>
          <button type="button" className={`header-link ${isQuotesActive ? "is-active" : ""}`} onClick={() => navigate("/nos-devis")}>
            {t.quotesNav}
          </button>
          {isLoggedIn ? null : (
            <button type="button" className={`header-link ${isLoginActive ? "is-active" : ""}`} onClick={() => navigate("/login")}>
              {t.login}
            </button>
          )}
          {isLoggedIn ? (
            <button type="button" className={`header-link ${isDashboardActive ? "is-active" : ""}`} onClick={() => navigate(isAdmin ? "/admin/contracts" : "/account")}>
              {isAdmin ? t.adminNav : t.profileNav}
            </button>
          ) : null}
          <button type="button" className={`header-pill ${isTestActive ? "is-active" : ""}`} onClick={() => navigate("/quote/duration")}>
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
