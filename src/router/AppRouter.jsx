import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import InsuranceDurationPage from "../features/quote/pages/InsuranceDurationPage";
import BoatDetailsPage from "../features/quote/pages/BoatDetailsPage";
import GuaranteeCalculationPage from "../features/quote/pages/GuaranteeCalculationPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import PaymentPage from "../features/payment/pages/PaymentPage";
import LoginPage from "../features/auth/pages/LoginPage";
import TestAccessPage from "../features/test/pages/TestAccessPage";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/quote/duration" replace />} />
        <Route path="/quote/duration" element={<InsuranceDurationPage />} />
        <Route path="/quote/boat" element={<BoatDetailsPage />} />
        <Route path="/quote/guarantee" element={<GuaranteeCalculationPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestAccessPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/quote/duration" replace />} />
    </Routes>
  );
}

export default AppRouter;
