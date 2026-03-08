import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nProvider";
import { login } from "../../../api/client";

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      localStorage.setItem("cash_token", data.token);
      localStorage.setItem("cash_user", JSON.stringify(data.user));
      navigate("/quote/duration");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.login}</h1>
      <p className="hero-subtitle">{t.secureAccessText}</p>

      <form className="quote-card register-card auth-card" onSubmit={onSubmit}>
        <input
          className="input"
          type="email"
          placeholder={t.email}
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          className="input"
          type="password"
          placeholder={t.password}
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-btn strong-btn" disabled={loading}>
          {loading ? "Loading..." : t.continue}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
