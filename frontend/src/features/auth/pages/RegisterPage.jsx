import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { useQuote } from "../../quote/QuoteContext";
import { createBoat, register } from "../../../api/client";

function toBackendMaterial(material) {
  if (material === "steel") return "steel";
  if (material === "wood") return "wood";
  if (material === "pneumatic") return "inflatable";
  return "polyester";
}

function toBackendType(type) {
  return type === "sail" ? "sailboat" : "motorboat";
}

function RegisterPage() {
  const { t } = useI18n();
  const { quote } = useQuote();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "Alger",
    wilaya: "Alger",
    postalCode: "16000"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const [firstName, ...rest] = form.fullName.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    setLoading(true);
    try {
      const registerData = await register({
        first_name: firstName || "User",
        last_name: lastName || "User",
        address: form.address,
        wilaya: form.wilaya,
        postal_code: form.postalCode,
        phone_number: form.phone,
        email: form.email,
        password: form.password,
        preferred_payment: "CIB"
      });

      localStorage.setItem("cash_token", registerData.token);
      localStorage.setItem("cash_user", JSON.stringify(registerData.user));

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

      const boatResponse = await createBoat(registerData.token, boatForm);
      const boatId = boatResponse?.data?.id;
      if (boatId) {
        localStorage.setItem("cash_last_boat_id", String(boatId));
      }
      localStorage.setItem("cash_quote_snapshot", JSON.stringify({
        duration: quote.duration,
        startDate: quote.startDate,
        endDate: quote.endDate,
        selectedGuarantees: quote.selectedGuarantees,
        estimatedPrice: quote.estimatedPrice,
        amount: quote.amount,
        boatName: quote.boatName
      }));

      navigate("/account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-center">
      <h1 className="hero-title">{t.createAccount}</h1>
      <p className="hero-subtitle">{t.createAccountText}</p>

      <form className="quote-card register-card" onSubmit={onSubmit}>
        <div className="card-toolbar">
          <BackNav to="/quote/guarantee" />
        </div>

        <div className="register-grid">
          <div className="register-intro">
            <h3>{t.secureQuote}</h3>
            <p>{t.registerDesc}</p>

            <div className="mini-price-card">
              <span>{t.totalPrice}</span>
              <strong>{quote.estimatedPrice || 0} DA</strong>
            </div>
          </div>

          <div className="register-form-fields">
            <input className="input" type="text" placeholder={t.fullName} value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} required />
            <input className="input" type="email" placeholder={t.email} value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
            <input className="input" type="text" placeholder={t.phone} value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required />
            <input className="input" type="text" placeholder="Address" value={form.address} onChange={(e) => onChange("address", e.target.value)} required />
            <input className="input" type="text" placeholder="Wilaya" value={form.wilaya} onChange={(e) => onChange("wilaya", e.target.value)} required />
            <input className="input" type="text" placeholder="Postal Code" value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} required />
            <input className="input" type="password" placeholder={t.password} value={form.password} onChange={(e) => onChange("password", e.target.value)} required />
            <input className="input" type="password" placeholder={t.confirmPassword} value={form.confirmPassword} onChange={(e) => onChange("confirmPassword", e.target.value)} required />
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="primary-btn strong-btn" disabled={loading}>
          {loading ? "Loading..." : t.createAndPay}
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
