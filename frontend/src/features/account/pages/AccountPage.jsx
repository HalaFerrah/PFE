import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { getMe, getMyBoats, getMyContracts } from "../../../api/client";
import { useQuote } from "../../quote/QuoteContext";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

function formatDuration(duration, t) {
  if (duration === "1_year") return t.year1;
  if (duration === "6_months") return t.months6;
  return t.months3;
}

function AccountPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { resetQuote } = useQuote();
  const token = localStorage.getItem("cash_token");
  const storedUser = JSON.parse(localStorage.getItem("cash_user") || "{}");
  const [user, setUser] = useState(storedUser);
  const [boats, setBoats] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    Promise.all([getMe(token), getMyBoats(token), getMyContracts(token)])
      .then(([meData, boatsData, contractsData]) => {
        if (!active) return;
        setUser(meData.user || storedUser);
        setBoats(boatsData.data || []);
        setContracts(contractsData.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, navigate, storedUser]);

  const latestContract = contracts[0];
  const displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Client";

  const handleLogout = () => {
    localStorage.removeItem("cash_token");
    localStorage.removeItem("cash_user");
    localStorage.removeItem("cash_last_boat_id");
    localStorage.removeItem("cash_last_contract_id");
    localStorage.removeItem("cash_quote_snapshot");
    navigate("/home");
  };

  const handleCreateContract = () => {
    resetQuote();
    localStorage.removeItem("cash_last_boat_id");
    localStorage.removeItem("cash_last_contract_id");
    localStorage.removeItem("cash_quote_snapshot");
    navigate("/quote/duration");
  };

  return (
    <section className="page-center full-profile-page">
      <div className="profile-hero-shell reveal rise-in">
        <div className="profile-hero-copy">
          <p className="eyebrow">{t.profileNav}</p>
          <h1 className="profile-page-title">{t.accountTitle}</h1>
          <p className="profile-page-subtitle">{t.accountSubtitle}</p>
        </div>
        <div className="profile-hero-actions">
          <BackNav to="/home" />
          <button type="button" className="header-link" onClick={handleLogout}>
            {t.logout}
          </button>
          <button type="button" className="header-pill" onClick={handleCreateContract}>
            {t.goToPayment}
          </button>
        </div>
      </div>

      {error ? <p className="form-error profile-error">{error}</p> : null}

      <div className="profile-shell reveal rise-in delay-1">
        <aside className="dashboard-panel profile-sidebar smooth-panel">
          <div className="profile-avatar">{(user.first_name || "C").slice(0, 1).toUpperCase()}</div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-email">{user.email || "-"}</p>
          <div className="summary-block compact-summary">
            <div className="summary-row"><span>{t.roleLabel}</span><strong>{user.role || "client"}</strong></div>
            <div className="summary-row"><span>{t.locationLabel}</span><strong>{user.wilaya || "-"}</strong></div>
            <div className="summary-row"><span>{t.phone}</span><strong>{user.phone_number || user.phone || "-"}</strong></div>
          </div>
        </aside>

        <div className="profile-main">
          <div className="profile-top-grid">
            <section className="dashboard-panel profile-panel smooth-panel">
              <div className="section-head">
                <h3>{t.profileSettings}</h3>
                <span className="section-chip">{t.accountWelcome}</span>
              </div>
              {loading ? <p>{t.loadingText}</p> : (
                <div className="summary-block">
                  <div className="summary-row"><span>{t.fullName}</span><strong>{displayName}</strong></div>
                  <div className="summary-row"><span>{t.email}</span><strong>{user.email || "-"}</strong></div>
                  <div className="summary-row"><span>{t.phone}</span><strong>{user.phone_number || user.phone || "-"}</strong></div>
                  <div className="summary-row"><span>{t.addressLabel}</span><strong>{user.address || "-"}</strong></div>
                  <div className="summary-row"><span>{t.locationLabel}</span><strong>{user.wilaya || "-"}</strong></div>
                </div>
              )}
            </section>

            <section className="dashboard-panel profile-panel profile-highlight-panel smooth-panel">
              <div className="section-head">
                <h3>{t.latestContractLabel}</h3>
                <span className="section-chip">{contracts.length} {t.contractsLabel}</span>
              </div>
              {latestContract ? (
                <div className="summary-block">
                  <div className="summary-row"><span>{t.assuranceId}</span><strong>{latestContract.policy_number}</strong></div>
                  <div className="summary-row"><span>{t.boatName}</span><strong>{latestContract.boat_name}</strong></div>
                  <div className="summary-row"><span>{t.duration}</span><strong>{formatDuration(latestContract.contract_duration, t)}</strong></div>
                  <div className="summary-row"><span>{t.totalPrice}</span><strong>{formatMoney(latestContract.total_general)}</strong></div>
                </div>
              ) : (
                <div className="empty-card">{loading ? t.loadingText : t.noContracts}</div>
              )}
            </section>
          </div>

          <section className="dashboard-panel profile-panel contract-section smooth-panel">
            <div className="section-head">
              <h3>{t.myBoats}</h3>
              <span className="section-chip">{boats.length}</span>
            </div>
            <div className="card-grid-list">
              {boats.length ? boats.map((boat) => (
                <div key={boat.id} className="list-card static-card boat-card smooth-card">
                  <strong>{boat.boat_name}</strong>
                  <span>{boat.registration_number || "-"}</span>
                  <span>{boat.boat_type}</span>
                  <span>{formatMoney(boat.total_insured_value)}</span>
                </div>
              )) : <div className="empty-card">{loading ? t.loadingText : t.noBoats}</div>}
            </div>
          </section>

          <section className="dashboard-panel profile-panel contract-section smooth-panel">
            <div className="section-head">
              <h3>{t.myContracts}</h3>
              <span className="section-chip">{contracts.length}</span>
            </div>
            <div className="table-header-row">
              <span>{t.assuranceId}</span>
              <span>{t.boatName}</span>
              <span>{t.startDate}</span>
              <span>{t.endDate}</span>
              <span>{t.totalPrice}</span>
            </div>
            <div className="table-list">
              {contracts.length ? contracts.map((contract) => (
                <button key={contract.id} type="button" className="table-row-card action-card smooth-card" onClick={() => navigate(`/contracts/${contract.id}`)}>
                  <span><strong>{contract.policy_number}</strong></span>
                  <span>{contract.boat_name}</span>
                  <span>{contract.start_date}</span>
                  <span>{contract.end_date}</span>
                  <span>{formatMoney(contract.total_general)}</span>
                </button>
              )) : <div className="empty-card">{loading ? t.loadingText : t.noContracts}</div>}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default AccountPage;
