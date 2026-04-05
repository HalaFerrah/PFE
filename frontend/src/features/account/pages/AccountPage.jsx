import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { getMe, getMyBoats, getMyContracts } from "../../../api/client";
import { useQuote } from "../../quote/QuoteContext";

const PROFILE_OVERRIDE_KEY = "cash_profile_override";
const PROFILE_AVATAR_KEY = "cash_profile_avatar";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

function AccountPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { resetQuote } = useQuote();
  const token = localStorage.getItem("cash_token");
  const storedUser = JSON.parse(localStorage.getItem("cash_user") || "{}");
  const storedOverride = JSON.parse(localStorage.getItem(PROFILE_OVERRIDE_KEY) || "{}");
  const storedAvatar = localStorage.getItem(PROFILE_AVATAR_KEY) || "";

  const [user, setUser] = useState(storedUser);
  const [boats, setBoats] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOverride, setProfileOverride] = useState(storedOverride);
  const [profileAvatar, setProfileAvatar] = useState(storedAvatar);
  const [settingsForm, setSettingsForm] = useState({
    first_name: storedOverride.first_name || storedUser.first_name || "",
    last_name: storedOverride.last_name || storedUser.last_name || "",
    email: storedOverride.email || storedUser.email || "",
    phone_number: storedOverride.phone_number || storedUser.phone_number || storedUser.phone || "",
    address: storedOverride.address || storedUser.address || "",
    wilaya: storedOverride.wilaya || storedUser.wilaya || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

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
        const backendUser = meData.user || storedUser;
        setUser(backendUser);
        setBoats(boatsData.data || []);
        setContracts(contractsData.data || []);
        setSettingsForm((prev) => ({
          ...prev,
          first_name: profileOverride.first_name || backendUser.first_name || "",
          last_name: profileOverride.last_name || backendUser.last_name || "",
          email: profileOverride.email || backendUser.email || "",
          phone_number: profileOverride.phone_number || backendUser.phone_number || backendUser.phone || "",
          address: profileOverride.address || backendUser.address || "",
          wilaya: profileOverride.wilaya || backendUser.wilaya || ""
        }));
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
  }, [token, navigate]);

  const mergedUser = useMemo(() => ({
    ...user,
    ...profileOverride,
    phone_number: profileOverride.phone_number || user.phone_number || user.phone || ""
  }), [user, profileOverride]);

  const displayName = `${mergedUser.first_name || ""} ${mergedUser.last_name || ""}`.trim() || "Client";

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

  const handleSettingsChange = (key, value) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (event) => {
    event.preventDefault();
    setSaveMessage("");
    setError("");

    if (settingsForm.newPassword || settingsForm.confirmNewPassword || settingsForm.currentPassword) {
      if (settingsForm.newPassword !== settingsForm.confirmNewPassword) {
        setError(t.passwordMismatch);
        return;
      }
    }

    const nextOverride = {
      first_name: settingsForm.first_name.trim(),
      last_name: settingsForm.last_name.trim(),
      email: settingsForm.email.trim(),
      phone_number: settingsForm.phone_number.trim(),
      address: settingsForm.address.trim(),
      wilaya: settingsForm.wilaya.trim()
    };

    setProfileOverride(nextOverride);
    localStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(nextOverride));
    if (profileAvatar) {
      localStorage.setItem(PROFILE_AVATAR_KEY, profileAvatar);
    }
    localStorage.setItem("cash_user", JSON.stringify({ ...storedUser, ...nextOverride }));

    if (settingsForm.newPassword) {
      setSaveMessage(t.settingsSavedPasswordNotice);
    } else {
      setSaveMessage(t.settingsSaved);
    }

    setSettingsForm((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }));
    setSettingsOpen(false);
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
          <button type="button" className="plus-contract-btn" onClick={handleCreateContract} aria-label={t.addContract}>
            <span>+</span>
          </button>
        </div>
      </div>

      {error ? <p className="form-error profile-error">{error}</p> : null}
      {saveMessage ? <p className="form-success profile-success">{saveMessage}</p> : null}

      <div className="profile-shell reveal rise-in delay-1">
        <aside className="dashboard-panel profile-sidebar smooth-panel">
          {profileAvatar ? (
            <img className="profile-avatar profile-avatar-image" src={profileAvatar} alt={displayName} />
          ) : (
            <div className="profile-avatar">{(mergedUser.first_name || "C").slice(0, 1).toUpperCase()}</div>
          )}
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-email">{mergedUser.email || "-"}</p>
          <div className="summary-block compact-summary">
            <div className="summary-row"><span>{t.roleLabel}</span><strong>{mergedUser.role || "client"}</strong></div>
            <div className="summary-row"><span>{t.locationLabel}</span><strong>{mergedUser.wilaya || "-"}</strong></div>
            <div className="summary-row"><span>{t.phone}</span><strong>{mergedUser.phone_number || "-"}</strong></div>
          </div>
          <div className="profile-sidebar-actions">
            <button type="button" className="header-link sidebar-action-btn" onClick={() => setSettingsOpen((prev) => !prev)}>
              <span className="sidebar-action-icon" aria-hidden="true">⚙</span>
              {t.settingsButton}
            </button>
            <button type="button" className="header-link sidebar-action-btn logout-action-btn" onClick={handleLogout}>
              <span className="sidebar-action-icon" aria-hidden="true">⎋</span>
              {t.logout}
            </button>
          </div>
        </aside>

        <div className="profile-main">
          {settingsOpen ? (
            <section className="dashboard-panel profile-panel smooth-panel">
              <div className="section-head">
                <h3>{t.profileSettings}</h3>
                <span className="section-chip">{t.settingsLabel}</span>
              </div>
              <form className="settings-form-grid" onSubmit={handleSaveSettings}>
                <div className="settings-avatar-block">
                  {profileAvatar ? (
                    <img className="settings-avatar-preview" src={profileAvatar} alt={displayName} />
                  ) : (
                    <div className="settings-avatar-preview settings-avatar-fallback">
                      {(mergedUser.first_name || "C").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <label className="upload-card settings-upload-card">
                    <span className="upload-label">{t.profilePicture}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>

                <div className="settings-fields-grid">
                  <input className="input" type="text" placeholder={t.firstName} value={settingsForm.first_name} onChange={(e) => handleSettingsChange("first_name", e.target.value)} />
                  <input className="input" type="text" placeholder={t.lastName} value={settingsForm.last_name} onChange={(e) => handleSettingsChange("last_name", e.target.value)} />
                  <input className="input" type="email" placeholder={t.email} value={settingsForm.email} onChange={(e) => handleSettingsChange("email", e.target.value)} />
                  <input className="input" type="text" placeholder={t.phone} value={settingsForm.phone_number} onChange={(e) => handleSettingsChange("phone_number", e.target.value)} />
                  <input className="input" type="text" placeholder={t.addressLabel} value={settingsForm.address} onChange={(e) => handleSettingsChange("address", e.target.value)} />
                  <input className="input" type="text" placeholder={t.locationLabel} value={settingsForm.wilaya} onChange={(e) => handleSettingsChange("wilaya", e.target.value)} />
                  <input className="input" type="password" placeholder={t.currentPassword} value={settingsForm.currentPassword} onChange={(e) => handleSettingsChange("currentPassword", e.target.value)} />
                  <input className="input" type="password" placeholder={t.newPassword} value={settingsForm.newPassword} onChange={(e) => handleSettingsChange("newPassword", e.target.value)} />
                  <input className="input" type="password" placeholder={t.confirmPassword} value={settingsForm.confirmNewPassword} onChange={(e) => handleSettingsChange("confirmNewPassword", e.target.value)} />
                </div>

                <div className="settings-form-footer">
                  <p className="settings-note">{t.settingsPasswordNote}</p>
                  <button type="submit" className="primary-btn strong-btn settings-save-btn">
                    {t.saveChanges}
                  </button>
                </div>
              </form>
            </section>
          ) : null}

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
